import config from 'config';
import fastify from 'fastify';
import * as mongoose from 'mongoose';
import path from 'path';
import pino, { LoggerOptions } from 'pino';
import ControllerApi from './api/controllers/controllerApi';
import registerPluginSwagger from './plugins/swagger';
import registerPluginSecure from './plugins/secure';
import registerPluginRedis from './plugins/redis';
import registerPluginRoles from './plugins/roles';
import registerPluginMultiPart from './plugins/multipart';
import registerPluginMetrics from './plugins/metrics';

const SPEC_PATH = path.join(__dirname, 'api', 'openapi', 'openapi.yml');

const optLogger:LoggerOptions = JSON.parse(JSON.stringify(config.get(`logger.${process.env.NODE_ENV}`)));
const logger = pino(optLogger);

// const app = fastify({ logger, querystringParser: str => qs.parse(str) });
const app = fastify({ logger });

async function loadOpenapiGlue() {
  const openapiGlueModule = await import('fastify-openapi-glue');
  return openapiGlueModule.default;
}

const options = {
  specification: SPEC_PATH,
  serviceHandlers: new ControllerApi(config.get('server.secure'), 
                                     config.get('redis.enable'), 
                                     config.get('server.repository')),
  prefix: 'v1'
};

// TODO: Añadir Socket.IO -> https://github.com/ducktors/fastify-socket.io
const start = async () => {
  try {
    await mongoose.connect(config.get('mongo.url'));
    mongoose.set('debug', config.get('mongo.debug') );
    app.log.info(`Connected to BBDD: ${config.get('mongo.url')}`);
   
    await registerPluginMetrics(app, config.get('server.metrics'));
    await registerPluginRedis(app, config.get('redis'));
    await registerPluginSwagger(app);
    await registerPluginSecure(app, config.get('server.secure'), config.get('redis.enable'));
    await registerPluginRoles(app);
    await registerPluginMultiPart(app, config.get('server.repository'))

    const openApiGlue = await loadOpenapiGlue();
    app.register(openApiGlue, options);

    // shutdown for close anything before close server 
    /*
    const listeners = ['SIGINT', 'SIGTERM'];
    listeners.forEach((signal) => {
      process.on(signal, async (e) => {
        app.log.debug({e});
        await app.close();
        process.exit(0);
      })
    });
    */

    app.log.debug(`Environment: ${process.env.NODE_ENV}`);
    await app.listen({ host: config.get('server.host'), port: config.get('server.port') });

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
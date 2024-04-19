import fastifyRedis from '@fastify/redis';
import { IConfigRedis } from '../utils/interface';

export default async function registerPluginRedis(app: any, config: IConfigRedis) {
  if (config.enable) {
    const opt = { url: config.url, closeClient: true };
    app.register(fastifyRedis, opt);
    app.log.info(`Registered redis plugin and connected to ${config.url}`);
  } else {
    app.log.info('Redis plugin is disable');
  }
}
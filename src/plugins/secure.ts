import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import { IConfigSecure } from '../utils/interface';
import Session from '../model/session';

export default async function registerPluginSecure(app: any, config: IConfigSecure, enableRedis: boolean) {

  app.register(jwt, { secret: config.secretJWT });

  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const routesWithoutAuth = config.unprotected ? config.unprotected : [];
    const _logger = request.log.child({ component: 'Hook_Secure', method: 'onRequest' });
    const url = `${request.method}:${request.url})`;
    
    const authExcludedRegex = routesWithoutAuth.map(path => new RegExp(path));
    for (const regex of authExcludedRegex) {
      if (regex.test(url)) {
        // Exclude that path of the authentication
        return;
      }
    }

    try {
      const modelSession = Session;
      if (!request.headers.authorization ||
          request.headers.authorization.split(' ').length !== 2) {
        _logger.error('No exist authorizations key');
        reply.code(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      } else {
        if (!enableRedis) {
          const session = await modelSession.findOne({ token: request.headers.authorization.split(' ')[1].trim() });
          if (session?.logoutAt) {
            _logger.info(`The session token ${session.token} is invalid for ${session.user}`);
            reply.code(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
          } else {
            await request.jwtVerify();
          }
        } else {
          const { redis } = request.server;
          const redisDataAux = await redis.get(`sessions:${request.headers.authorization.split(' ')[1].trim()}`);
          if (redisDataAux) {
            const redisData = JSON.parse(redisDataAux);
            if (redisData.logoutAt) {
              _logger.info(`The session token ${redisData.token} is invalid for ${redisData.user}`);
              reply.code(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
            } else {
              await request.jwtVerify();
            }
          } else {
            await request.jwtVerify();
          }
        }
      }
    } catch (err: any) {
      reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
    // }
  });
}
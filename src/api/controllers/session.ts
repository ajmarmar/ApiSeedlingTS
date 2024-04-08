import { FastifyRequest, FastifyReply } from 'fastify';
import { toMs } from 'ms-typescript';
import os from 'os';
import BaseCtrl from './base';
import User from '../../model/user';
import { ILogin } from '../interfaces/interfaces';
import { IConfigSecure } from 'src/utils/interface';
import Session from '../../model/session';
import { TOKEN_EXPIRATION_TIME_DEFAULT } from '../../utils/constants';

export default class SessionController extends BaseCtrl {
  config: IConfigSecure;
  modelUser: any;
  enableRedis: boolean;

  constructor(config: IConfigSecure, enableRedis: boolean) {
    super();
    this.modelUser = User;
    this.model = Session;
    this.config = config;
    this.enableRedis = enableRedis;
  }

  async doLogin(request: FastifyRequest, reply: FastifyReply) {
    const _logger = request.log.child({ model: this.model.modelName, method: 'doLogin' });
    const dataLogin = request.body as ILogin;
    const tokenExpirationTime = this.config.tokenExpirationTime || TOKEN_EXPIRATION_TIME_DEFAULT;

    try {
      _logger.info(`Search user: ${dataLogin.username}`);
      const user = await this.modelUser.findOne({ email: dataLogin.username });

      if (!user) {
        _logger.error(`the user ${dataLogin.username} not exist`);
        return reply.code(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }

      const isMatch = await user.comparePassword(dataLogin.password);
      if (!isMatch) {
        return reply.code(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }

      const token = request.server.jwt.sign({ user }, {
        expiresIn: tokenExpirationTime
      });

      if (!this.enableRedis) {
        await new this.model({ user: user._id, token, server: os.hostname() }).save();
      } else {
        const { redis } = request.server;
        const redisData = {
          user: user._id, createdAt: new Date(),
          type: dataLogin.type, logoutAt: '', server: os.hostname()
        };
        redis.set(`sessions:${token}`, JSON.stringify(redisData), 'PX', toMs(tokenExpirationTime));
      }

      return reply.status(200).send({ token });

    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  }

  async doLogout(request: FastifyRequest, reply: FastifyReply) {
    const _logger = request.log.child({ model: this.model.modelName, method: 'doLogout' });

    try {
      _logger.info(`Search session: ${request.headers.authorization}`);

      if (!request.headers.authorization || request.headers.authorization.split(' ').length !== 2) {
        _logger.error('No exist token of authorization');
        return reply.status(204).send();
      }

      if (!this.enableRedis) {
        const session = await this.model.findOne({ token: request.headers.authorization.split(' ')[1].trim() });
        if (session && !session.logoutAt) {
          _logger.info(`Close session for ${session.user}`);
          session.logoutAt = new Date();
          await session.save();
        }
      } else {
        const { redis } = request.server;
        const keyRedis = `sessions:${request.headers.authorization.split(' ')[1].trim()}`;
        const ttl = await redis.ttl(keyRedis);

        if (ttl > 0) {
          const redisDataAux = await redis.get(keyRedis);

          if (redisDataAux) {
            const redisData = JSON.parse(redisDataAux);

            if (redisData && !redisData.logoutAt) {
              _logger.info(`Close session for ${redisData.user}`);
              redisData.logoutAt = new Date();
              redis.set(keyRedis, JSON.stringify(redisData), 'EX', ttl);
            }
          }
        }
      }

      return reply.status(204).send();

    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  }

  async getStatistic(request: FastifyRequest, reply: FastifyReply) {
    const _logger = request.log.child({ model: this.model.modelName, method: 'getStatistic' });

    try {
      _logger.info('Collecting data');
      if (!this.enableRedis) {
        /* empty */
        const obj = await this.model.aggregate([
          {
            '$group': {
              '_id': '$server', 
              'total': {
                '$sum': 1
              }, 
              'activeSessions': {
                '$sum': {
                  '$cond': [
                    {
                      '$eq': [
                        '$logoutAt', null
                      ]
                    }, 1, 0
                  ]
                }
              }, 
              'inactiveSessions': {
                '$sum': {
                  '$cond': [
                    {
                      '$ne': [
                        '$logoutAt', null
                      ]
                    }, 1, 0
                  ]
                }
              }
            }
          }, {
            '$project': {
              'server': '$_id', 
              'total': 1, 
              'activeSessions': 1, 
              'inactiveSessions': 1, 
              '_id': 0
            }
          }
        ]).exec();
        return reply.status(200).send(obj);
      } else {
        /* empty */
      }
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  }
  
  async registertUser(request: FastifyRequest, reply: FastifyReply) {
    const _logger = request.log.child({ model: this.model.modelName, method: 'registertUser' });
    const tokenExpirationTime = this.config.tokenExpirationTime || TOKEN_EXPIRATION_TIME_DEFAULT;

    _logger.info('Register user');
    try {
      const user = await this.modelUser.create(request.body);
      _logger.info(`User Created with id: ${user._id}`);
      const body =  request.body as ILogin;
      request.body = {username: user.email, password: body.password};
      await this.doLogin(request, reply);

    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  }
}
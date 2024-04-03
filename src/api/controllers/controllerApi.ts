import { FastifyRequest, FastifyReply } from 'fastify';
import UserController from './user';
import SessionController from './session';
import { IParamsGetId, IQueryList } from '../interfaces/interfaces';
import { IConfigSecure } from 'src/utils/interface';

export default class ControllerApi {
  userCtrl: UserController;
  sessionCtrl: SessionController;
  config: IConfigSecure;

  constructor(config: IConfigSecure, enableRedis: boolean) {
    this.userCtrl = new UserController();
    this.sessionCtrl = new SessionController(config, enableRedis);
    this.config = config;
  }

  // Session
  doLogin(req: FastifyRequest, reply: FastifyReply) {
    this.sessionCtrl.doLogin(req, reply);
  }
  doLogout(req: FastifyRequest, reply: FastifyReply) {
    this.sessionCtrl.doLogout(req, reply);
  }
  getStatistic(req: FastifyRequest, reply: FastifyReply) {
    this.sessionCtrl.getStatistic(req, reply);
  }

  // Users
  insertUser(req: FastifyRequest, reply: FastifyReply) {
    this.userCtrl.insert(req, reply);
  }

  getUser(req: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.get(req, reply);
  }

  updateUser(req: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.update(req, reply);
  }

  deleteUser(req: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.delete(req, reply);
  }

  listUser(req: FastifyRequest<{ Querystring: IQueryList }>, reply: FastifyReply) {
    this.userCtrl.list(req, reply);
  }

  updatePasswordUser(req: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.updatePasswordUser(req, reply);
  }
}
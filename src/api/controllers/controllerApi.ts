import { FastifyRequest, FastifyReply } from 'fastify';
import UserController from './user';
import SessionController from './session';
import RoleController from './role';
import { IParamsGetId, IQueryList } from '../interfaces/interfaces';
import { IConfigSecure } from 'src/utils/interface';

export default class ControllerApi {
  userCtrl: UserController;
  sessionCtrl: SessionController;
  roleCtrl: RoleController;
  config: IConfigSecure;

  constructor(config: IConfigSecure, enableRedis: boolean) {
    this.userCtrl = new UserController();
    this.sessionCtrl = new SessionController(config, enableRedis);
    this.roleCtrl = new RoleController();
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

  registertUser(req: FastifyRequest, reply: FastifyReply) {
    this.sessionCtrl.registertUser(req, reply);
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

  // Roles
  insertRole(req: FastifyRequest, reply: FastifyReply) {
    this.roleCtrl.insert(req, reply);
  }

  getRole(req: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.roleCtrl.get(req, reply);
  }

  updateRole(req: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.roleCtrl.update(req, reply);
  }

  deleteRole(req: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.roleCtrl.delete(req, reply);
  }

  listRole(req: FastifyRequest<{ Querystring: IQueryList }>, reply: FastifyReply) {
    this.roleCtrl.list(req, reply);
  }
}
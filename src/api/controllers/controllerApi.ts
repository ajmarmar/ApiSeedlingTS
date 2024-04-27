import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import UserController from './user';
import SessionController from './session';
import RoleController from './role';
import FileController from './file';
import { IParamsGetId, IQueryList, IRequestServer } from '../interfaces/interfaces';
import { IConfigRepository, IConfigSecure } from 'src/utils/interface';

export default class ControllerApi {
  userCtrl: UserController;
  sessionCtrl: SessionController;
  roleCtrl: RoleController;
  fileCtrl: FileController;
  config: IConfigSecure;

  constructor(config: IConfigSecure, enableRedis: boolean, repositoryConfig: IConfigRepository) {
    this.userCtrl = new UserController();
    this.sessionCtrl = new SessionController(config, enableRedis);
    this.roleCtrl = new RoleController();
    this.fileCtrl = new FileController(repositoryConfig);
    this.config = config;
  }

  // Session
  doLogin(req: IRequestServer, reply: FastifyReply) {
    this.sessionCtrl.doLogin(req, reply);
  }
  doLogout(req: IRequestServer, reply: FastifyReply) {
    this.sessionCtrl.doLogout(req, reply);
  }
  getStatistic(req: IRequestServer, reply: FastifyReply) {
    this.sessionCtrl.getStatistic(req, reply);
  }

  registertUser(req: IRequestServer, reply: FastifyReply) {
    this.sessionCtrl.registertUser(req, reply);
  }

  // Users
  insertUser(req: IRequestServer, reply: FastifyReply) {
    this.userCtrl.insert(req, reply);
  }

  getUser(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.get(req, reply);
  }

  updateUser(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.update(req, reply);
  }

  deleteUser(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.delete(req, reply);
  }

  listUser(req: IRequestServer<{ Querystring: IQueryList }>, reply: FastifyReply) {
    this.userCtrl.list(req, reply);
  }

  updatePasswordUser(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.userCtrl.updatePasswordUser(req, reply);
  }

  // Roles
  insertRole(req: IRequestServer, reply: FastifyReply) {
    this.roleCtrl.insert(req, reply);
  }

  getRole(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.roleCtrl.get(req, reply);
  }

  updateRole(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.roleCtrl.update(req, reply);
  }

  deleteRole(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.roleCtrl.delete(req, reply);
  }

  listRole(req: IRequestServer<{ Querystring: IQueryList }>, reply: FastifyReply) {
    this.roleCtrl.list(req, reply);
  }

  // Files
  upload(req: IRequestServer, reply: FastifyReply) {
    this.fileCtrl.upload(req, reply);
  }

  download(req: IRequestServer, reply: FastifyReply) {
    this.fileCtrl.download(req, reply);
  }

  getFile(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.fileCtrl.get(req, reply);
  }

  deleteFile(req: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) {
    this.fileCtrl.delete(req, reply);
  }

  listFile(req: IRequestServer<{ Querystring: IQueryList }>, reply: FastifyReply) {
    this.fileCtrl.list(req, reply);
  }

}
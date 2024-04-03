import { FastifyRequest, FastifyReply } from 'fastify';
import BaseCtrl from './base';
import User from '../../model/user';
import { IParamsGetId, IPasswordBody } from '../interfaces/interfaces';

export default class UserController extends BaseCtrl {
  // override model = User;

  constructor() {
    super();
    // this.projection = { _id: 1, username: 1 };
    this.model = User;
  }

  updatePasswordUser = async (request: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'updatePasswordUser' });
    try {
      const pwd = (request.body as IPasswordBody).password;
      if (!pwd) {
        return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: 'Password is not define' });
      }
    
      _logger.info(`Get object Id: ${request.params.id}`);
      const user = await this.model.findById(request.params.id);
      if (!user || !user._id) {
        _logger.error({ model: this.model.modelName, id: request.params.id }, 'User not found');
        return reply.status(404).send({ statusCode: 404, code: 'HTTP_404', error: 'User not found' });
      }
     
      user.password = pwd;
      user.save();
        
      return reply.status(200).send(user);
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };
}
import { FastifyReply } from 'fastify';
import qs2m from 'qs-to-mongo';
import { isEmptyObject } from '../../utils/utils';
import { AccessControl } from 'accesscontrol';
import { IParamsGetId, IProjection, IQueryList, IRequestServer, IUserRequest } from '../interfaces/interfaces';
import mongoose from 'mongoose';

export default class BaseCtrl {
  model: any;
  projection: IProjection | undefined;

  insert = async (request: IRequestServer, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Insert' });
    try {
      let body = {};
      Object.assign(body, request.body, { createdBy: (request.user as IUserRequest).user._id });

      const permission = this.getCreateAccess(request.accessControl, request.user as IUserRequest, this.model.collection.name );
      if (!permission.granted) {
        return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }
      body = permission.filter(body);

      const obj = await new this.model(body).save();
      _logger.info(`Created with id: ${obj._id}`);
      return reply.status(201).send(obj);
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };

  get = async (request: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Get' });
    try {
      _logger.info(`Get object Id: ${request.params.id}`); 

      const obj = await this.model.findById(request.params.id );
      if (!obj || !obj._id) {
        _logger.error({ model: this.model.modelName, id: request.params.id }, 'Object not found');
        return reply.status(404).send({ statusCode: 404, code: 'HTTP_404', message: 'Object not found' });
      }

      const permission = this.getReadAccess(request.accessControl, request.user as IUserRequest, this.model.collection.name, obj.createdBy );
      if (!permission.granted) {
        return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }

      return reply.status(200).send(permission.filter(obj.toJSON()));
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };

  update = async (request: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Update' });
    try {
      let body = {};
      Object.assign(body, request.body, { lastModBy: (request.user as IUserRequest).user._id });

      _logger.info(`Get object Id: ${request.params.id}`);

      const obj = await this.model.findById(request.params.id);
      if (!obj || !obj._id) {
        _logger.error({ model: this.model.modelName, id: request.params.id }, 'Object not found');
        return reply.status(404).send({ statusCode: 404, code: 'HTTP_404', message: 'Object not found' });
      }

      const permission = this.getUpdateAccess(request.accessControl, request.user as IUserRequest, this.model.collection.name, obj.createdBy );
      if (!permission.granted) {
        return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }
      body = permission.filter(body);
      
      const updObj = await this.model.findByIdAndUpdate(
        request.params.id,
        body,
        { new: true }
      );

      return reply.status(200).send(updObj);
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };

  delete = async (request: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Delete' });
    try {
      _logger.info(`Get object Id: ${request.params.id}`);

      const obj = await this.model.findById(request.params.id);
      if (!obj || !obj._id) {
        _logger.error({ model: this.model.modelName, id: request.params.id }, 'Object not found');
        return reply.status(404).send({ statusCode: 404, code: 'HTTP_404', message: 'Object not found' });
      }

      const permission = this.getDeleteAccess(request.accessControl, request.user as IUserRequest, this.model.collection.name, obj.createdBy );
      if (!permission.granted) {
        return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }

      await this.model.findByIdAndDelete(request.params.id);

      return reply.status(204).send();
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };

  list = async (request: IRequestServer<{ Querystring: IQueryList }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'List' });
   
    try {
      const query = qs2m(request.query);
      _logger.debug({ query }, 'Query params');

      const permissionAny = this.getReadAccessAny(request.accessControl, request.user as IUserRequest, this.model.collection.name );
      const permissonOwn = this.getReadAccessOwn(request.accessControl, request.user as IUserRequest, this.model.collection.name);
      if (!permissionAny.granted && !permissonOwn.granted){
        return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }

      // If the permisson is of type own, then we filter by createdby, too.
      if (!permissionAny.granted && permissonOwn.granted){
        query.criteria.createdBy = new mongoose.Types.ObjectId((request.user as IUserRequest).user._id)
      }

      const obj = await this.model.aggregate([
        ...(query.criteria ? [{ $match: query.criteria }] : []),
        {
          '$facet': {
            'totalCount': [
              { '$count': 'total' }
            ],
            'rows': [
              ...(query.options.projection ?
                [{ $project: query.options.projection }] :
                !isEmptyObject(this.projection) ? [{ $project: this.projection }] : []),
              ...(query.options.sort ? [{ $sort: query.options.sort }] : []),
              ...(query.options.skip ? [{ $skip: query.options.skip }] : []),
              ...(query.options.limit ? [{ $limit: query.options.limit }] : []),
            ]
          }
        },
        {
          $addFields: {
            count: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    '$totalCount.total', 0],
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            count: 1,
            rows: 1,
          },
        }
      ]);
      obj[0].rows = obj[0].rows.map( (r: any) => {
        //r = this.convertObjectIdToString(r);
        r = JSON.parse(JSON.stringify(r));
        return permissionAny.filter(r)}
      );
      return reply.status(200).send(obj[0]);
    } catch (err: any) {
      _logger.error(err);
      return reply.status(500).send({ statusCode: 500, code: 'HTTP_500', message: 'Error to list model ' + this.model.modelName });
    }
  };

  getReadAccess = (ac: AccessControl, user: IUserRequest, resource: string, own?: string ) => {
    let permission = ac.can(user.user.roles[0]).readAny(resource);
    if (!permission.granted && user.user._id === own) {
      permission = ac.can(user.user.roles[0]).readOwn(resource);
    }
    return permission;
  } 

  getReadAccessOwn = (ac: AccessControl, user: IUserRequest, resource: string ) => {
    return ac.can(user.user.roles[0]).readOwn(resource);
  } 

  getReadAccessAny = (ac: AccessControl, user: IUserRequest, resource: string ) => {
    return ac.can(user.user.roles[0]).readAny(resource);
  } 

  getUpdateAccess = (ac: AccessControl, user: IUserRequest, resource: string, own?: string ) => {
    let permission = ac.can(user.user.roles[0]).updateAny(resource);
    if (!permission.granted && user.user._id === own) {
      permission = ac.can(user.user.roles[0]).updateOwn(resource);
    }
    return permission;
  } 

  getCreateAccess = (ac: AccessControl, user: IUserRequest, resource: string, own?: string ) => {
    let permission = ac.can(user.user.roles[0]).createAny(resource);
    if (!permission.granted && user.user._id === own) {
      permission = ac.can(user.user.roles[0]).createOwn(resource);
    }
    return permission;
  } 

  getDeleteAccess = (ac: AccessControl, user: IUserRequest, resource: string, own?: string ) => {
    let permission = ac.can(user.user.roles[0]).deleteAny(resource);
    if (!permission.granted && user.user._id === own) {
      permission = ac.can(user.user.roles[0]).deleteOwn(resource);
    }
    return permission;
  } 

  /*
  convertObjectIdToString = (obj: any) => {
    for (const key in obj) {
        if (mongoose.Types.ObjectId.isValid(obj[key])) {
            obj[key] = obj[key].toString();
        } else if (typeof obj[key] === 'object') {
            this.convertObjectIdToString(obj[key]);
        }
    }
    return obj;
  }
  */
  /*
  getDocument = async (id: string, reply: FastifyReply) => {
    const obj = await this.model.findById(id);
    if (!obj || !obj._id) {
      //_logger.error({ model: this.model.modelName, id: id }, 'Object not found');
      return reply.status(404).send({ statusCode: 404, code: 'HTTP_404', message: 'Object not found' });
    }
    return obj;
  }
  */
}
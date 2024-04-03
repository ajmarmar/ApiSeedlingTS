import { FastifyRequest, FastifyReply } from 'fastify';
import qs2m from 'qs-to-mongo';
import { isEmptyObject } from '../../utils/utils';
import { IParamsGetId, IProjection, IQueryList } from '../interfaces/interfaces';

export default class BaseCtrl {
  model: any;
  projection: IProjection | undefined;

  insert = async (request: FastifyRequest, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Insert' });
    try {
      const obj = await new this.model(request.body).save();
      _logger.info(`Created with id: ${obj._id}`);
      return reply.status(201).send(obj);
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };

  get = async (request: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Get' });
    try {
      _logger.info(`Get object Id: ${request.params.id}`);
      const obj = await this.model.findOne({ _id: request.params.id });
      return reply.status(200).send(obj);
    } catch (err: any) {
      _logger.error(err);
      return reply.status(500).send({ error: err.message });
    }
  };

  update = async (request: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Update' });
    try {
      _logger.info(`Get object Id: ${request.params.id}`);
      const obj = await this.model.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true }
      );
      if (!obj || !obj._id) {
        _logger.error({ model: this.model.modelName, id: request.params.id }, 'Object not found');
        return reply.status(404).send({ statusCode: 404, code: 'HTTP_404', error: 'Object not found' });
      }
      return reply.status(200).send(obj);
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };

  delete = async (request: FastifyRequest<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'Delete' });
    try {
      _logger.info(`Get object Id: ${request.params.id}`);
      await this.model.findByIdAndDelete(request.params.id);
      return reply.status(204).send();
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  };

  list = async (request: FastifyRequest<{ Querystring: IQueryList }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'List' });
    try {
      const query = qs2m(request.query);
      _logger.debug({ query }, 'Query params');
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
      ]).exec();
      return reply.status(200).send(obj[0]);
    } catch (err: any) {
      _logger.error(err);
      return reply.status(500).send({ code: 500, message: 'Error to list model ' + this.model.modelName });
    }
  };
}
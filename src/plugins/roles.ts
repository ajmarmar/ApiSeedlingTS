import { IConfigRedis } from '../utils/interface';
import Role from '../model/role';
import { AccessControl } from 'accesscontrol';
import { IRequestServer } from 'src/api/interfaces/interfaces';
import { FastifyReply } from 'fastify';

export default async function registerPluginRoles(app: any) {
  const roleCtrl = Role;

  const roles = await roleCtrl.find({});

  const roleList = roles.map( e => {
    const {role, resource, action, attributes } = e;
    return { role, resource, action, attributes };
  });
  const ac = new AccessControl(roleList);

  // app.decorateRequest('accessControl', ac);
  app.addHook('onRequest', (request: IRequestServer, reply: FastifyReply, done: () => void) => { 
    request.accessControl = ac;
    done();
  });

}
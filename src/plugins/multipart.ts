import multipart from '@fastify/multipart';
import { IConfigRepository } from '../utils/interface';
import { FastifyReply, FastifyRequest } from 'fastify';
import File from '../model/file';
import fs from 'fs';
import stream, { pipeline } from 'stream';
import util from 'util';
import { IBodyUpload, IRequestServer, IUserRequest } from '../api/interfaces/interfaces';
import { getCreateAccess } from '../utils/utils';
import { compressFileSync } from '../utils/gz';
 
const pump = util.promisify(pipeline);

export default async function registerPluginMultiPart(app: any, config: IConfigRepository) {
  if (config && config.limits) {
    //app.register(multipart), { addToBody: true, attachFieldsToBody: true, limits: config.limits};
    app.register(multipart, { attachFieldsToBody: true, limits: config.limits});
  } else {
    app.register(multipart);
  }

  app.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, function (req:FastifyRequest, body:Buffer, done:Function) {
    done(null, body);
  });

  //TODO: esto debe de ir en el controlador pero actualmente si lo definimos en el openapi
  //da un error: "body must be object"
  //Por tanto, de moemnto y hasta que resuelva el problema el endpoint de upload irá aqui.
  app.post('/v1/upload', async (request: IRequestServer, reply: FastifyReply) => {
    // tu código aquí sin validación automática de schema
    const modelFile = File;
    const arrFiles = [];

    const _logger = request.log.child({ model: modelFile.modelName, method: 'Insert' });

    const permission = getCreateAccess(request.accessControl, request.user as IUserRequest, modelFile.collection.name );
    if (!permission.granted) {
      return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
    }

    const lastFile: any = await modelFile.find().sort({createdAt: -1}).limit(1);
    let repoPath: string;

    const files = await request.saveRequestFiles();

    if (!lastFile || lastFile.length === 0) {
      repoPath = 'repo_1';
      fs.mkdirSync(`${config.path}/${repoPath}`);
    } else {
      repoPath = lastFile[0].repositoryPath;
      const listFiles = fs.readdirSync(`${config.path}/${repoPath}`);
      if (listFiles.length + files.length > config.maxFile) {
        const count = Number(repoPath.split('_')[1]) + 1;
        repoPath = `repo_${count}`
        fs.mkdirSync(`${config.path}/${repoPath}`);
      }
    }

    const body: IBodyUpload = request.body as IBodyUpload;
    
    for await (const file of files) {
      let name = `${(new Date()).getTime()}_${file.filename}`;
      let outputPath = `${config.path}/${repoPath}/${name}`;
      let compress = false;

      if (!config.compress || 
          config.noCompress.some( e => file.filename.toLowerCase().endsWith(e.toLocaleLowerCase()))) {
        //await pump(await file.toBuffer(), fs.createWriteStream(outputPath));   
        fs.copyFileSync(file.filepath, outputPath);
      } else {
        name += '.gz';
        compress = true;

        compressFileSync(file.filepath, outputPath);
      }

      _logger.info(`upload file ${file.filename}`);

      arrFiles.push( {
        fileName: file.filename,
        name: name,
        mimeType: file.mimetype,
        repositoryPath: repoPath,
        resource: body.resource.value,
        idResource: body.idResource.value,
        compressed: compress,
        createdBy: (request.user as IUserRequest).user._id
      });
    }
    const f = await modelFile.insertMany(arrFiles);
    const list = { count: f.length, rows: f}
    reply.send(list);
  });


}

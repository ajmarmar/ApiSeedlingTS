import { FastifyRequest, FastifyReply } from 'fastify';
import pump from 'pump';
import fs from 'fs';
import File from '../../model/file';
import BaseCtrl from './base';
import { IBodyUpload, IParamsGetId, IRequestServer, IUserRequest } from '../interfaces/interfaces';
import { IConfigRepository } from '../../utils/interface';
import { compressFileSync, descompressFileSync } from '../../utils/gz';


export default class FileController extends BaseCtrl {
  config: IConfigRepository;

  constructor(config: IConfigRepository) {
    super();
    this.config = config;
    this.model = File;
  }
 
  // upload = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
  upload = async (request: IRequestServer, reply: FastifyReply) => {
    // tu código aquí sin validación automática de schema
    const modelFile = File;
    const arrFiles = [];

    const _logger = request.log.child({ model: modelFile.modelName, method: 'Insert' });

    const permission = this.getCreateAccess(request.accessControl, request.user as IUserRequest, modelFile.collection.name );
    if (!permission.granted) {
      return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
    }

    const lastFile: any = await modelFile.find().sort({createdAt: -1}).limit(1);
    let repoPath: string;

    const files = await request.saveRequestFiles();

    if (!lastFile || lastFile.length === 0) {
      repoPath = 'repo_1';
      fs.mkdirSync(`${this.config.path}/${repoPath}`);
    } else {
      repoPath = lastFile[0].repositoryPath;
      const listFiles = fs.readdirSync(`${this.config.path}/${repoPath}`);
      if (listFiles.length + files.length > this.config.maxFile) {
        const count = Number(repoPath.split('_')[1]) + 1;
        repoPath = `repo_${count}`
        fs.mkdirSync(`${this.config.path}/${repoPath}`);
      }
    }

    const body: IBodyUpload = request.body as IBodyUpload;
    
    for await (const file of files) {
      let name = `${(new Date()).getTime()}_${file.filename}`;
      let outputPath = `${this.config.path}/${repoPath}/${name}`;
      let compress = false;

      if (!this.config.compress || 
          this.config.noCompress.some( e => file.filename.toLowerCase().endsWith(e.toLocaleLowerCase()))) {
        //pump(file.file, fs.createWriteStream(outputPath));   
        fs.copyFileSync(file.filepath, outputPath);
      } else {
        name += '.tar.gz';
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
  }

  download = async (request: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply) => {
    const _logger = request.log.child({ model: this.model.modelName, method: 'download' });
    try {
      _logger.info(`Get file Id: ${request.params.id}`);

      const obj = await this.model.findById(request.params.id);
      if (!obj || !obj._id) {
        _logger.error({ model: this.model.modelName, id: request.params.id }, 'Object not found');
        return reply.status(404).send({ statusCode: 404, code: 'HTTP_404', message: 'Object not found' });
      }

      const permission = this.getReadAccess(request.accessControl, request.user as IUserRequest, this.model.collection.name, obj.createdBy );
      if (!permission.granted) {
        return reply.status(401).send({ statusCode: 401, code: 'HTTP_401', message: 'Unauthorize' });
      }

      // Verificar si el archivo existe
      const pathFile = `${this.config.path}/${obj.repositoryPath}/${obj.name}`;
      if (!fs.existsSync(pathFile)) {
        return reply.status(404).send({ mensaje: 'Archivo no encontrado' });
      }

      // Leer el archivo del sistema de archivos
      let file = fs.readFileSync(pathFile);

      // Configurar la respuesta para descargar el archivo
      reply.header('Content-Disposition', `attachment; filename=${obj.fileName}`);
      reply.header('Content-Type', 'application/octet-stream');

      // Enviar el archivo como respuesta
      if (obj.compressed){
        // Descomprimir el archivo
        const pathTemp = `${this.config.path}/_temp`; 

        descompressFileSync(pathFile, `${pathTemp}/${obj.fileName}`);
        file = fs.readFileSync(`${pathTemp}/${obj.fileName}`);
      }
      reply.status(200).send(file);

    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  }

  override delete = async (request: IRequestServer<{ Params: IParamsGetId }>, reply: FastifyReply): Promise<never> => {
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

      fs.unlinkSync(`${this.config.path}/${obj.repositoryPath}/${obj.name}`);

      return reply.status(204).send();
    } catch (err: any) {
      _logger.error(err);
      return reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  }
}
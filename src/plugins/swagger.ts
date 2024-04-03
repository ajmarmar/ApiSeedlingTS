import staticPlugin from '@fastify/static';
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
// import { fileURLToPath } from 'url';

export default function registerPluginSwagger(app: any) {
  const swaggerUIDirectory = path.join(__dirname, '../..', 'node_modules', 'swagger-ui-dist');
  const SPEC_PATH = path.join(__dirname, '..', 'api', 'openapi', 'openapi.yml');

  app.register(staticPlugin, {
    root: swaggerUIDirectory,
    prefix: '/swagger-ui/',
  });

  app.get('/spec', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const spec = await fs.promises.readFile(SPEC_PATH, 'utf8');
      reply.type('application/yaml').send(spec);
    } catch (err: any) {
      reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
    }
  });

  app.get('/api_docs', (req: FastifyRequest, reply: FastifyReply) => {
    const indexPath = path.join(__dirname, '..', 'public', 'swagger_ui.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        reply.code(500).send({ statusCode: 500, code: 'HTTP_500', message: err.message });
        return;
      }
      reply.type('text/html').send(data);
    });
  });
}
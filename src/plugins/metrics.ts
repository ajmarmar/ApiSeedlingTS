import metricsPlugin from 'fastify-metrics';
import { IConfigMetrics } from '../utils/interface';

export default async function registerPluginMetrics(app: any, config: IConfigMetrics) {

  if (!config || !config.enable) {
    return;
  }
  app.register(metricsPlugin, { endpoint: config.path || '/metrics' });

}
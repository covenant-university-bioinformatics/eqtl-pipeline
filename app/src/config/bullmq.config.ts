export default {
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '1'),
  queueName: process.env.QUEUE_NAME || 'eqtl-smr-pipeline',
  queuePlotName: 'eqtl-plot-pipeline',
  connection: {
    host: process.env.REDIS_BULL_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  limiter: {
    max: parseInt(process.env.MAX_LIMIT || '1'),
    duration: parseInt(process.env.DURATION_LIMIT || '60000'),
    // groupKey: 'annotation',
  },
  numWorkers: process.env.NUMWORKERS || 1,
};

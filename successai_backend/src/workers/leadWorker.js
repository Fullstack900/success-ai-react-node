import { Queue, Worker } from 'bullmq';
import * as leadService from '../leads/leads.service.js';
import redisConnection from '../common/utils/config.js'

const bulkLookupQueue = new Queue('bulkLookupQueue',{
  connection: redisConnection
});

const bulkLookupQueueLimit = new Queue('bulkLookupQueueLimit',{
  connection: redisConnection
});


const workerLimit = new Worker('bulkLookupQueueLimit', async job => {
  const { ids, user, requestId } = job.data;
  const chunkSize = 1;
  try {
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunkIds = ids.slice(i, i + chunkSize).map(id => ({id : id}))
      await leadService.Bulklookup(chunkIds, user, null, null, requestId);
    }
  } catch (error) {
    console.error('Error processing job1:', error);

    if (job.attemptsMade < job.opts.attempts - 1) {
      console.log(`Retrying job:`, job);
      throw error; 
    }

  }
},
{ 
  connection: redisConnection,
  concurrency: 5,
}
);
const worker = new Worker('bulkLookupQueue', async job => {
  const { ids, user, requestId } = job.data;
  const chunkSize = 1;

  try {
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunkIds = ids.slice(i, i + chunkSize).map(id => ({id : id}))
      await leadService.Bulklookup(chunkIds, user, null, null, requestId);
    }
  } catch (error) {
    console.error('Error processing job2:', error);

    if (job.attemptsMade < job.opts.attempts - 1) {
      console.log(`Retrying job:`, job);
      throw error; 
    }

  }
},
{ 
  connection: redisConnection,
  concurrency: 5,
}
);

// worker.on('completed', (job) => {
//   console.log(`Job completed:`, job.id);
// });

// worker.on('failed', (job, error) => {
//   console.error(`Job failed:`, job.id, error.message);
// });

// workerLimit.on('completed', (job) => {
//   console.log(`Job completed:`, job.id);
// });

// workerLimit.on('failed', (job, error) => {
//   console.error(`Job failed:`, job.id, error.message);
// });

export  {bulkLookupQueue, bulkLookupQueueLimit};

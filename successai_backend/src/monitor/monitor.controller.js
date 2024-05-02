import * as monitorService from './monitor.service.js';

export async function getAllRequests(req, res) {
    try {
      const result = await monitorService.getAllRequests(req.body);
      res.send(result);
    } catch (error) {
      res.status(error.response.status).send(error.response.data);
    }
  }
import HttpErrors from 'http-errors';
import * as userService from '../../user/user.service.js';
import * as tokenService from '../../token/token.service.js';
import * as adminService from '../../admin/admin.service.js';
import * as appSumoService from '../../appsumo/appsumo.service.js';

export default async function auth(req, res, next) {
  const token = extractTokenFromHeader(req);
  if (!token) throw new HttpErrors.Unauthorized('Invalid auth token');

  let userId, iat;

  try {
    ({ userId, iat } = tokenService.verifyAuthToken(token));
  } catch (error) {
    throw new HttpErrors.Unauthorized('Invalid auth token');
  }

  const user = await userService.findById(userId);
  if (!user) throw new HttpErrors.NotFound('Invalid auth token');

  if (iat < Math.floor(user.lastLogout.getTime() / 1000)) {
    throw new HttpErrors.Unauthorized('Invalid auth token');
  }

  req.user = user;

  next();
}

function extractTokenFromHeader(req) {
  const [type, token] = req.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

export async function apiAccessAuth(req, res, next) {
  const token = extractTokenFromHeader(req);
  if (!token) throw new HttpErrors.Unauthorized('Invalid auth token');

  let userId;

  try {
    ({ userId } = tokenService.verifyAuthToken(token));
  } catch (error) {
    throw new HttpErrors.Unauthorized('Invalid auth token');
  }

  const user = await userService.findById(userId);
  if (!user) throw new HttpErrors.NotFound('Invalid auth token');

  req.user = user;

  next();
}

export async function adminAuth(req, res, next) {
  const token = extractTokenFromHeader(req);
  if (!token) throw new HttpErrors.Unauthorized('Invalid auth token');

  let userId, iat;

  try {
    ({ userId, iat } = tokenService.verifyAuthToken(token));
  } catch (error) {
    throw new HttpErrors.Unauthorized('Invalid auth token');
  }

  const user = await adminService.findById(userId);
  if (!user) throw new HttpErrors.NotFound('Invalid auth token');

  if (iat < Math.floor(user.lastLogout.getTime() / 1000)) {
    throw new HttpErrors.Unauthorized('Invalid auth token');
  }

  req.user = user;

  next();
}

export async function appSumoAuth(req, res, next) {
  const token = extractTokenFromHeader(req);
  if (!token) throw new HttpErrors.Unauthorized('Invalid auth token');

  let userId;

  try {
    ({ userId } = tokenService.verifyAuthToken(token));
  } catch (error) {
    throw new HttpErrors.Unauthorized('Invalid auth token');
  }

  const user = process.env.APP_SUMO_USER === userId ? userId : false ;
  if (!user) throw new HttpErrors.NotFound('Invalid auth token');

  req.user = user;

  next();
}

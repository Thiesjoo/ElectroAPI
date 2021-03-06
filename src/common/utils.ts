import axios, { AxiosInstance } from 'axios';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { of } from 'rxjs';
import { ApiConfigService } from 'src/config/configuration';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { AuthTokenPayloadDTO } from '../models';

/**
 * Extract possible values of an enumeration as a array of strings
 * @param {T} type An enumeration type
 */
export function enumValues<T>(type: T): string[] {
  return Object.keys(type).map((k) => type[k as string]);
}

/**
 * Extract possible keys of an enumeration as a array of strings
 * @param {T} type An enumeration type
 */
export function enumKeys<T>(type: T): string[] {
  return Object.keys(type).filter((x) => !(parseInt(x) >= 0));
}

/**
 * Error handler for a controller end-point
 * @param {Response} res The response to the client
 */
export function catchErrorFn(res: Response) {
  return (err: any) => {
    if (err) {
      res.statusMessage =
        err.reason || err?.errors?.name || err.message || 'Unknown Error';
    }
    res.status(err?.status || HttpStatus.INTERNAL_SERVER_ERROR).send();
    return of();
  };
}

/**
 * Throw an error if the value if not found
 * @param x the value to check
 */
export function checkUndefined(x) {
  if (!x) {
    throw new NotFoundException();
  }
  return x;
}

/**
 * Extract the Uid from a user out of a barebones request
 * @param req request
 */
export function extractUid(req: Request): string {
  return (req?.user as AuthTokenPayloadDTO)?.sub;
}

/**
 * Custom axios instance, so all settings can be applied in one place
 */
export const axiosInst: AxiosInstance = axios.create({});

/** Extract tokens from request */
export function extractToken(
  request: Request,
  configService: ApiConfigService,
  token: 'access' | 'refresh',
): string {
  return (
    ExtractJwt.fromUrlQueryParameter('auth')(request) ||
    ExtractJwt.fromAuthHeaderAsBearerToken()(request) ||
    request.cookies[configService.cookieNames[token]]
  );
}

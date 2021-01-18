import { HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { Response, Request } from 'express';
import { of } from 'rxjs';
import { SetMetadata } from '@nestjs/common';

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

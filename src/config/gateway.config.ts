import { fromEvent, Observable } from 'rxjs';
import { filter, first, map, mergeMap, share, takeUntil } from 'rxjs/operators';
import { Namespace, Server, ServerOptions } from 'socket.io';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import {
  AbstractWsAdapter,
  MessageMappingProperties,
} from '@nestjs/websockets';
import { DISCONNECT_EVENT } from '@nestjs/websockets/constants';
import { corsSettings } from './configuration';

export class IoAdapter extends AbstractWsAdapter {
  public create(
    port = 0,
    options?: { room?: string; socketIO?: Partial<ServerOptions> },
  ): Server | Namespace {
    if (!options) {
      return this.createIOServer(port, {});
    }
    const { room } = options;
    return room
      ? this.createIOServer(port, options.socketIO).of(room)
      : this.createIOServer(port, options.socketIO);
  }

  public createIOServer(port: number, socketOptions: Partial<ServerOptions>) {
    if (this.httpServer && port === 0) {
      return new Server(this.httpServer, {
        ...socketOptions,
        cors: corsSettings,
      });
    }
    return new Server(port, socketOptions);
  }

  public bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    const disconnect$ = fromEvent(client, DISCONNECT_EVENT).pipe(
      share(),
      first(),
    );

    handlers.forEach(({ message, callback }) => {
      const source$ = fromEvent(client, message).pipe(
        mergeMap((payload: any) => {
          const { data, ack } = this.mapPayload(payload);
          return transform(callback(data, ack)).pipe(
            filter((response: any) => !isNil(response)),
            map((response: any) => [response, ack]),
          );
        }),
        takeUntil(disconnect$),
      );
      source$.subscribe(([response, ack]) => {
        if (response.event) {
          return client.emit(response.event, response.data);
        }
        isFunction(ack) && ack(response);
      });
    });
  }

  public mapPayload(payload: any): { data: any; ack?: () => void } {
    if (!Array.isArray(payload)) {
      if (isFunction(payload)) {
        return { data: undefined, ack: payload };
      }
      return { data: payload };
    }
    const lastElement = payload[payload.length - 1];
    const isAck = isFunction(lastElement);
    if (isAck) {
      const size = payload.length - 1;
      return {
        data: size === 1 ? payload[0] : payload.slice(0, size),
        ack: lastElement,
      };
    }
    return { data: payload };
  }
}

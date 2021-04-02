interface TypeRecord<T, U, V> {
  ' _emitterType'?: T;
  ' _eventsType'?: U;
  ' _emitType'?: V;
}
export declare type ReturnTypeOfMethod<T> = T extends (...args: any[]) => any
  ? ReturnType<T>
  : void;
export declare type ListenerType<T> = [T] extends [(args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];
declare type ClientOverriddenMethods<TEmitter, TEventRecord, TEmitRecord> = {
  on<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (args: ListenerType<TEventRecord[P]>) => void,
  ): TEmitter;
  addEventListener<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (args: ListenerType<TEventRecord[P]>) => void,
  ): TEmitter;
  removeListener<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: any[]) => any,
  ): TEmitter;
  removeEventListener<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: any[]) => any,
  ): TEmitter;
  once<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (args: ListenerType<TEventRecord[P]>) => void,
  ): TEmitter;
  emit<P extends keyof TEmitRecord, T>(
    this: T,
    event: P,
    args: ListenerType<TEmitRecord[P]>,
    ack: (payload: ReturnTypeOfMethod<TEmitRecord[P]>) => void,
  ): TEmitter;
};
declare type OverriddenKeysClient = keyof ClientOverriddenMethods<
  any,
  any,
  any
>;
export declare type ClientEventEmitter<
  TEmitterType,
  TEventRecord,
  TEmitRecord,
  UnneededMethods extends Exclude<
    OverriddenKeysClient,
    keyof TEmitterType
  > = Exclude<OverriddenKeysClient, keyof TEmitterType>,
  NeededMethods extends Exclude<
    OverriddenKeysClient,
    UnneededMethods
  > = Exclude<OverriddenKeysClient, UnneededMethods>
> = TypeRecord<TEmitterType, TEventRecord, TEmitRecord> &
  Pick<TEmitterType, Exclude<keyof TEmitterType, OverriddenKeysClient>> &
  Pick<
    ClientOverriddenMethods<TEmitterType, TEventRecord, TEmitRecord>,
    NeededMethods
  >;
export default ClientEventEmitter;

declare type ServerOverriddenMethods<TEventRecord> = {
  emit<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    args: ListenerType<TEventRecord[P]>,
  ): boolean;
};

declare type OverriddenKeysServer = keyof ServerOverriddenMethods<any>;

export declare type ServerEventEmitter<
  TEmitterType,
  TEventRecord,
  UnneededMethods extends Exclude<
    OverriddenKeysServer,
    keyof TEmitterType
  > = Exclude<OverriddenKeysServer, keyof TEmitterType>,
  NeededMethods extends Exclude<
    OverriddenKeysServer,
    UnneededMethods
  > = Exclude<OverriddenKeysServer, UnneededMethods>
> = TypeRecord<TEmitterType, TEventRecord, null> &
  Pick<TEmitterType, Exclude<keyof TEmitterType, OverriddenKeysServer>> &
  Pick<ServerOverriddenMethods<TEventRecord>, NeededMethods>;

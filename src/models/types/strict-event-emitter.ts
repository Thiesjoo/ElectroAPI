export interface TypeRecord<T, U, V> {
  ' _emitterType'?: T;
  ' _eventsType'?: U;
  ' _emitType'?: V;
}
export declare type ReturnTypeOfMethod<T> = T extends (...args: any[]) => any
  ? ReturnType<T>
  : void;
declare type ListenerType<T> = [T] extends [(args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];
export declare type OverriddenMethods<TEmitter, TEventRecord, TEmitRecord> = {
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
export declare type OverriddenKeys = keyof OverriddenMethods<any, any, any>;
export declare type StrictEventEmitter<
  TEmitterType,
  TEventRecord,
  TEmitRecord,
  UnneededMethods extends Exclude<OverriddenKeys, keyof TEmitterType> = Exclude<
    OverriddenKeys,
    keyof TEmitterType
  >,
  NeededMethods extends Exclude<OverriddenKeys, UnneededMethods> = Exclude<
    OverriddenKeys,
    UnneededMethods
  >
> = TypeRecord<TEmitterType, TEventRecord, TEmitRecord> &
  Pick<TEmitterType, Exclude<keyof TEmitterType, OverriddenKeys>> &
  Pick<
    OverriddenMethods<TEmitterType, TEventRecord, TEmitRecord>,
    NeededMethods
  >;
export default StrictEventEmitter;

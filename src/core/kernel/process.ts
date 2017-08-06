/* tslint:disable */

/*
 * Copyright (c) 2016 Dessix.
 *
 * Original code here: https://github.com/Dessix/Primal/blob/master/src/kernel/process.ts
 */

// import { registerClass } from 'screeps-profiler'
import { ProcessRegistry } from './processRegistry'

// type getRes<TFunc extends ((...args: any[]) => TReturn), TReturn> = TReturn;
// type Return<T extends new (k: Kernel, pid: ProcessId, par: ProcessId) => S, S = any> = S;
export function registerProc(prefix?: string): any {
  return function <TPROCESS, _TCPROC extends IProcess & TPROCESS> (ctor: MetaProcessCtor<TPROCESS, _TCPROC>): void {
    ProcessRegistry.register(ctor, prefix)
  }
}
/**
 * A Process carries out tasks within the operating system.
 *
 * @export
 * @abstract
 * @class Process
 * @implements {IProcess<TMemory>}
 * @template TMemory The process memory type.
 * @template ProcessMemory The process memory type.
 */
export abstract class Process<TMemory extends ProcessMemory = ProcessMemory> implements IProcess<TMemory> {
  /**
   * The process ID.
   *
   * @type {ProcessId}
   * @memberof Process
   */
  public readonly pid: ProcessId
  /**
   * If the process has a parent, this will contain the `ProcessId` of said process.
   * Otherwise, it's set to the root process (PID 0).
   *
   * @type {ProcessId}
   * @memberof Process
   */
  public readonly parentPid: ProcessId
  /**
   * The kernel object this process is running in.
   *
   * @type {IKernel}
   * @memberof Process
   */
  public readonly kernel: IKernel
  /**
   * The base heat level of the process.
   *
   * @type {number}
   * @memberof Process
   */
  public readonly baseHeat: number = 10
  /**
   * Set to `true` if the process is a Service.
   *
   * @deprecated
   * @type {boolean}
   * @memberof Process
   */
  public readonly service: boolean = false
  /**
   * One of the `ProcessStatus` constants: `TERM`, `EXIT`, or `RUN`.
   *
   * @type {ProcessStatus}
   * @memberof Process
   */
  public status: ProcessStatus

  constructor(kernel: IKernel, pid: ProcessId, parentPid: ProcessId) {
    this.kernel = kernel
    this.pid = pid
    this.parentPid = parentPid
    this.status = ProcessStatus.RUN
  }

  public static prefixedClassName?: string = undefined;

  public static get className(): string {
    return this.prefixedClassName !== undefined ? this.prefixedClassName : this.name;
  }

  public static get classPath(): string {
    return this.className;
  }

  public static get rawClassName(): string {
    return this.name;
  }

  public get classPath(this: this): string {
    return (<{ constructor: ProcessConstructor<Process>; }><{}>this).constructor.classPath;
  }

  public get className(this: this): string {
    return this.classPath;
  }

  public get taskmgr(): ITaskManager {
    return this.kernel;
  }

  public get memory(): TMemory {
    const mem = this.kernel.getProcessMemory<TMemory>(this.pid);
    Reflect.defineProperty(this, "memory", { value: mem });//TODO: Create @cachedGetter decorator for this behaviour
    return mem;
  }

  public spawnChildProcess<TPROCESS, TCPROC extends TPROCESS & IProcess<ProcessMemory> & { init: Function; }>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>): ProcInit<TCPROC> {
    return this.kernel.spawnProcess<TCPROC, TCPROC>(processCtor, this.pid)
  }

  public spawnIndependentProcess<TPROCESS, TCPROC extends TPROCESS & IProcess<ProcessMemory> & { init: Function; }>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>): ProcInit<TCPROC> {
    return this.kernel.spawnProcess<TCPROC, TCPROC>(processCtor, 0 as ProcessId)
  }

  public assertParentProcess(): void {
    this.kernel.getProcessByIdOrThrow(this.parentPid)
  }

  public abstract run(): void
}

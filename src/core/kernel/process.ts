/*
 * Copyright (c) 2016 Dessix.
 *
 * Original code here: https://github.com/Dessix/Primal/blob/master/src/kernel/process.ts
 */

// import { registerClass } from 'screeps-profiler'
import { ProcessRegistry } from './processRegistry'

// type getRes<TFunc extends ((...args: any[]) => TReturn), TReturn> = TReturn;
// type Return<T extends new (k: Kernel, pid: ProcessId, par: ProcessId) => S, S = any> = S;

export function registerProc<TPROCESS, _TCPROC extends IProcess & TPROCESS>(ctor: MetaProcessCtor<TPROCESS, _TCPROC>): void {
  ProcessRegistry.register(ctor)
  // registerClass(ctor, ctor.className); this might slow shit waaay down; allow configuring it at the start of MAIN.
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

  public static get className(): string { return this.name }

  public get className(this: Process<TMemory>): string {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    return (<{ constructor: ProcessConstructor<Process<TMemory>> }><any>this).constructor.className
  }

  public get memory(): TMemory {
    const mem = this.kernel.getProcessMemory<TMemory>(this.pid)
    Reflect.defineProperty(this, 'memory', { value: mem })// TODO: Create @cachedGetter decorator for this behaviour
    return mem
  }

  public spawnChildProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>): TPROCESS {
    return this.kernel.spawnProcess<TCPROC, TCPROC>(processCtor, this.pid)
  }

  public spawnIndependentProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>): TPROCESS {
    return this.kernel.spawnProcess<TCPROC, TCPROC>(processCtor, 0 as ProcessId)
  }

  public assertParentProcess(): void {
    this.kernel.getProcessByIdOrThrow(this.parentPid)
  }

  public abstract run(): void
}

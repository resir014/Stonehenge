/*
 * Copyright (c) 2016 Dessix.
 *
 * Original code here: https://github.com/Dessix/Primal/blob/master/src/kernel/ikernel.g.d.ts
 */

declare type ProcessId = number

/**
 * Process status codes. Status code `0` always means the process is running
 * normally.
 *
 * @enum {number}
 */
declare const enum ProcessStatus {
  TERM = -2,
  EXIT,
  RUN
}

/**
 * Interface for the Process object.
 *
 * @interface IProcess
 * @template TMemory The process memory type.
 * @template ProcessMemory The process memory type.
 */
interface IProcess<TMemory extends ProcessMemory = ProcessMemory> {
  /**
   * A shorthand to the `className` of the process.
   *
   * @type {string}
   * @memberof IProcess
   */
  readonly className: string
  /**
   * The process ID.
   *
   * @type {ProcessId}
   * @memberof IProcess
   */
  readonly pid: ProcessId
  /**
   * If the process has a parent, this will contain the `ProcessId` of said process.
   * Otherwise, it's set to the root process (PID 0).
   *
   * @type {ProcessId}
   * @memberof IProcess
   */
  readonly parentPid: ProcessId
  /**
   * The kernel object this process is running in
   *
   * @type {IKernel}
   * @memberof IProcess
   */
  readonly kernel: IKernel
  /**
   * The base heat level of the process.
   *
   * @type {number}
   * @memberof IProcess
   */
  readonly baseHeat: number
  /**
   * Set to `true` if the process is a Service.
   *
   * @deprecated
   * @type {boolean}
   * @memberof IProcess
   */
  readonly service: boolean
  /**
   * The process memory entry
   *
   * @type {TMemory}
   * @memberof IProcess
   */
  readonly memory: TMemory

  /**
   * One of the `ProcessStatus` constants: `TERM`, `EXIT`, or `RUN`.
   *
   * @type {ProcessStatus}
   * @memberof IProcess
   */
  status: ProcessStatus

  /**
   * Runs the process.
   *
   * @memberof IProcess
   */
  run(): void
}

type ProcessConstructor<TPROCESS extends IProcess = IProcess> = {
  new (kernel: IKernel, pid: ProcessId, parentPid: ProcessId): TPROCESS
  readonly className: string
}

type MetaProcessCtor<TPROCESS, TCPROC extends TPROCESS & IProcess> = (new (k: IKernel, pid: ProcessId, parentPid: ProcessId) => TPROCESS) & ProcessConstructor<TCPROC>

/**
 * Parameters required by the kernel.
 *
 * @interface KernelParameters
 */
interface KernelParameters {
  /**
   * The upcoming Process ID.
   *
   * @type {ProcessId}
   * @memberof KernelParameters
   */
  nextPid: ProcessId
  /**
   * This is actually a hack for the Mocha testing to not include the kernel
   * logs in the testing process.
   *
   * @type {boolean}
   * @memberof KernelParameters
   */
  isTest?: boolean
}

/**
 * Base memory structures of the kernel.
 *
 * @interface KernelMemory
 */
interface KernelMemory {
  /**
   * Parameters required by the kernel.
   *
   * @type {KernelParameters}
   * @memberof KernelMemory
   */
  kpar?: KernelParameters
  /**
   * The process table.
   *
   * @type {(SerializedProcessTable | null)}
   * @memberof KernelMemory
   */
  proc?: SerializedProcessTable | null
  /**
   * The process memory.
   *
   * @type {({ [pid: number]: ProcessMemory | null | undefined })}
   * @memberof KernelMemory
   */
  pmem?: { [pid: number/** {ProcessId} */]: ProcessMemory | null | undefined }
}


/**
 * Portion of the kernel that deals with task (process) management.
 *
 * @interface ITaskManager
 */
interface ITaskManager {
  spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>, parentPid: ProcessId): TPROCESS
  spawnProcessByClassName(processName: string, parentPid?: ProcessId): IProcess | undefined
  addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS
  killProcess(processId: ProcessId): void

  getProcessById<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS | undefined
  getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS
  getChildProcesses(parentPid: ProcessId): ProcessId[]
  getProcessesByClass<TPROCESS extends IProcess>(constructor: ProcessConstructor<TPROCESS>): TPROCESS[]
  getProcessesByClassName<TPROCESS extends IProcess>(className: string): TPROCESS[]

  run(maxCpu: number): void
}

/**
 * Portion of the kernel that deals with memory management.
 *
 * @interface IMemoryManager
 */
interface IMemoryManager {
  getProcessMemory<TMEMORY extends ProcessMemory>(pid: ProcessId): TMEMORY
  getProcessMemory(pid: ProcessId): ProcessMemory
  setProcessMemory(pid: ProcessId, memory: ProcessMemory): void
  deleteProcessMemory(pid: ProcessId): void
}

/**
 * Default interface for the Kernel object.
 *
 * @interface IKernel
 * @extends {ITaskManager}
 * @extends {IMemoryManager}
 */
interface IKernel extends ITaskManager, IMemoryManager {
  readonly mem: KernelMemory
  kernelLog(logLevel: LogLevel, message: string): void
  getProcessCount(): number
  loadProcessTable(): void
  saveProcessTable(): void
  reboot(): void
}

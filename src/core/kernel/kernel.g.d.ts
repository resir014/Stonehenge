/* tslint:disable */

/*
 * Copyright (c) 2016 Dessix.
 *
 * Original code here: https://github.com/Dessix/Primal/blob/master/src/kernel/ikernel.g.d.ts
 */

declare type ProcessId = number

declare const enum ProcessStatus {
  TERM = -2,
  EXIT = -1,
  RUN = 0,
}

interface ProcInit<TPROC extends IProcess & { init: Function }, TINIT extends TPROC["init"]= TPROC["init"]> {
  init: TINIT;
  pid: IProcess["pid"];
}

interface IProcess<TMemory extends ProcessMemory = ProcessMemory> {
  readonly className: string;
  readonly classPath: string;
  readonly pid: ProcessId;
  readonly parentPid: ProcessId;
  readonly kernel: IKernel;
  readonly baseHeat: number;
  readonly memory: TMemory;

  status: ProcessStatus;

  run(): void;
}

interface Initialized<T> { }

interface INeedInitialized<T> {
  init(...args: any[]): T & Initialized<T>;
}

type ProcessConstructor<TPROCESS extends IProcess = IProcess> = {
  new(kernel: IKernel, pid: ProcessId, parentPid: ProcessId): TPROCESS & { init: Function };
  readonly className: string;
  readonly rawClassName: string;
  prefixedClassName?: string;
  readonly classPath: string;
};

type MetaProcessCtor<TPROCESS, TCPROC extends TPROCESS & IProcess> = (new (k: IKernel, pid: ProcessId, parentPid: ProcessId) => TPROCESS) & ProcessConstructor<TCPROC>;

interface ITaskManager {
  spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess & { init: Function }>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>, parentPid: ProcessId): ProcInit<TCPROC>;
  spawnProcessByClassName(processName: string, parentPid?: ProcessId): ProcInit<IProcess & { init: Function }> | undefined;
  addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS;
  killProcess(processIdOrProcess: ProcessId | IProcess | undefined): void;
  reparent(process: IProcess, newParent: IProcess): void;

  getProcessById<TPROCESS extends IProcess>(pid: ProcessId | undefined): TPROCESS | undefined;
  getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS;
  getChildProcesses(parentPid: ProcessId): ProcessId[];
  getProcessesByClass<TPROCESS extends IProcess>(constructor: ProcessConstructor<TPROCESS>): TPROCESS[];
  getProcessesByClassName<TPROCESS extends IProcess>(className: string): TPROCESS[];

  run(maxCpu: number): void;
}

interface IMemoryManager {
  getProcessMemory<TMEMORY extends ProcessMemory>(pid: ProcessId): TMEMORY;
  getProcessMemory(pid: ProcessId): ProcessMemory;
  setProcessMemory(pid: ProcessId, memory: ProcessMemory): void;
  deleteProcessMemory(pid: ProcessId): void;
}

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

interface KernelMemory {
  proc?: SerializedProcessTable | null;
  pmem?: { [pid: number/** {ProcessId} */]: ProcessMemory | null | undefined };
  kpar?: KernelParameters;
}

interface ILogger {
  log(logLevel: LogLevel, message: string): void
  kLog(logLevel: LogLevel, message: string): void
  logError<TErr extends Error>(err: TErr): void
}

interface IKernel extends ITaskManager, IMemoryManager, ILogger {
  readonly mem: KernelMemory;

  loadProcessTable(): void;
  saveProcessTable(): void;
  reboot(): void;
}

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

interface IProcess<TMemory extends ProcessMemory = ProcessMemory> {
  readonly className: string
  readonly pid: ProcessId
  readonly parentPid: ProcessId
  readonly kernel: IKernel
  readonly baseHeat: number
  readonly service: boolean
  readonly memory: TMemory

  status: ProcessStatus

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
   * The process table
   *
   * @type {(SerializedProcessTable | null)}
   * @memberof KernelMemory
   */
  proc?: SerializedProcessTable | null
  pmem?: { [pid: number/** {ProcessId} */]: ProcessMemory | null | undefined }
}


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

interface IMemoryManager {
  getProcessMemory<TMEMORY extends ProcessMemory>(pid: ProcessId): TMEMORY
  getProcessMemory(pid: ProcessId): ProcessMemory
  setProcessMemory(pid: ProcessId, memory: ProcessMemory): void
  deleteProcessMemory(pid: ProcessId): void
}

interface IKernel extends ITaskManager, IMemoryManager {
  readonly mem: KernelMemory
  kernelLog(logLevel: LogLevel, message: string): void
  getProcessCount(): number
  loadProcessTable(): void
  saveProcessTable(): void
  reboot(): void
}

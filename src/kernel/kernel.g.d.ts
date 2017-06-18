interface ProcessId<TPROCESS extends IProcess = IProcess> extends Number, TypeTag<ProcessId<TPROCESS>, TPROCESS> { }

declare const enum ProcessStatus {
  DEAD = -1,
  ALIVE,
  SLEEP
}

declare const enum ProcessPriority {
  HIGH = 1,
  MID,
  LOW
}

interface ProcessSleep {
  start: number
  duration: number
}

interface IProcess {
  className: string
  pid: number
  parentPid: number
  memory: any
  kernel: IKernel
  status: ProcessStatus
  priority: ProcessPriority
  sleepInfo?: ProcessSleep
  setMemory(memory: any): void
  run(): number
}

type ProcessConstructor<T extends IProcess = IProcess> = {
  className: string

  new (kernel: IKernel, pid: number, parentPid: number, priority: ProcessPriority): T
}

interface KernelMemory {
  process?: ProcessTable | null
  processMemory?: { [pid: number]: ProcessMemory }
}

interface ITaskManager {
  run(): void
}

interface IMemoryManager {
  //
}

interface IKernel extends ITaskManager, IMemoryManager {
  loadProcessTable(): void
  garbageCollection(): void
  storeProcessTable(): void
  reboot(): void
}

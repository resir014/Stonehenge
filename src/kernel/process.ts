import { ProcessRegistry } from "./processRegistry";

export function RegisterProcess(): ClassDecorator {
  return (target: ProcessConstructor) => {
    ProcessRegistry.register(target)
  }
}

export abstract class Process implements IProcess {
  public className: string
  public pid: number
  public parentPid: number
  public kernel: IKernel
  public memory: any
  public status: ProcessStatus
  public priority: ProcessPriority
  public sleepInfo?: ProcessSleep

  constructor(kernel: IKernel, pid: number, parentPid: number, priority: ProcessPriority = ProcessPriority.LOW) {
    this.kernel = kernel
    this.pid = pid
    this.parentPid = parentPid
    this.priority = priority
  }

  public static get className(): string { return this.name; }

  public setMemory(memory: any): void {
    this.memory = memory;
  }

  public abstract run(): number
}

// import { registerClass } from 'screeps-profiler'
import { ProcessRegistry } from './processRegistry'

// type getRes<TFunc extends ((...args: any[]) => TReturn), TReturn> = TReturn;
// type Return<T extends new (k: Kernel, pid: ProcessId, par: ProcessId) => S, S = any> = S;

export function registerProc<TPROCESS, _TCPROC extends IProcess & TPROCESS>(ctor: MetaProcessCtor<TPROCESS, _TCPROC>): void {
  ProcessRegistry.register(ctor)
  // registerClass(ctor, ctor.className); this might slow shit waaay down; allow configuring it at the start of MAIN.
}

export abstract class Process<TMemory extends ProcessMemory = ProcessMemory> implements IProcess<TMemory> {
  public readonly pid: ProcessId
  public readonly parentPid: ProcessId
  public readonly kernel: IKernel
  public readonly baseHeat: number = 10
  public readonly service: boolean = false
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

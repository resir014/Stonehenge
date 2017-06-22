import * as Config from '../../config/config'
import { log } from '../../lib/logger/log'
import { ProcessRegistry } from './processRegistry'

interface KernelRecord {
  heat: number
  service: boolean
  processCtor: ProcessConstructor
  process: IProcess
}

/**
 * Just like an actual OS kernel, a Kernel controls all of the processes
 * happening in our Screeps codebase.
 *
 * @export
 * @class Kernel
 * @implements {IKernel}
 */
export class Kernel implements IKernel {
  private processTable: (Map<ProcessId, KernelRecord>)
  private readonly kernelSymbol: string = Config.KERNEL_SYMBOL ? Config.KERNEL_SYMBOL : '//'
  private readonly getKmem: () => KernelMemory

  public basicLog(logLevel: LogLevel, message: string): void {
    switch (logLevel) {
      case LogLevel.ERROR: {
        return log.debug(message)
      }
      case LogLevel.WARNING: {
        return log.warning(message)
      }
      case LogLevel.INFO: {
        return log.info(message)
      }
      default: {
        return log.debug(message)
      }
    }
  }

  public kernelLog(logLevel: LogLevel, message: string): void {
    this.basicLog(logLevel, `[${this.kernelSymbol}] ${message}`)
  }

  public get mem(): KernelMemory & { kpar: KernelParameters } {
    return this.getKmem() as KernelMemory & { kpar: KernelParameters }
  }

  public constructor(fetchKmem: () => KernelMemory) {
    this.processTable = new Map<ProcessId, KernelRecord>()
    this.getKmem = fetchKmem
    const kmem = fetchKmem()
    if (kmem.kpar === undefined) {
      kmem.kpar = {
        nextPid: 0
      }
    } else if (kmem.kpar.nextPid === undefined) {
      kmem.kpar.nextPid = 0
    }
  }

  public loadProcessTable(): void {
    const mem = this.getKmem()
    let proc = mem.proc
    if (proc == null) {
      this.kernelLog(LogLevel.INFO, 'Spawning new process table')
      mem.proc = proc = []
    }
    this.processTable.clear()

    for (const i of proc) {
      const record = this.loadProcessEntry(i)
      if (record !== null) {
        this.processTable.set(i.id, record)
      }
    }
  }

  public saveProcessTable(): void {
    const processes = Array.from(this.processTable.values())
    const table: SerializedProcessTable = new Array<SerializedProcess>(processes.length)
    for (let i = processes.length; i > 0; --i) {
      const record = processes[i]

      // tslint:disable-next-line:switch-default
      switch (record.process.status) {
        case ProcessStatus.EXIT:
        case ProcessStatus.TERM:
          table.splice(i) // Remove spare from presized array
          continue
      }
      const produced: SerializedProcess = {
        id: record.process.pid,
        pa: record.process.parentPid,
        ex: record.process.className,
        he: record.heat,
        se: record.service,
      }
      table[i] = produced
    }
    this.getKmem().proc = table
  }

  public getFreePid(): ProcessId {
    const kpar = this.mem.kpar
    const newPid = kpar.nextPid
    const nextPid = newPid + 1
    kpar.nextPid = (nextPid < 1000000) ? nextPid : 1
    return newPid
  }

  public reboot(): void {
    this.processTable = new Map<ProcessId, KernelRecord>()
    this.getKmem().pmem = {}
  }

  public getProcessCount(): number {
    return this.processTable.size
  }

  public getProcessMemory(processId: ProcessId): ProcessMemory {
    const mem = this.getKmem()
    let pmem = mem.pmem
    if (pmem === undefined) { mem.pmem = pmem = {} }
    let pmemi = pmem[processId]
    if (pmemi === undefined || pmemi === null) { pmem[processId] = pmemi = {} }
    return pmemi
  }

  public setProcessMemory(pid: ProcessId, memory: ProcessMemory): void {
    const mem = this.getKmem()
    let pmem = mem.pmem
    if (pmem === undefined) { mem.pmem = pmem = {} }
    pmem[pid] = memory
  }

  public deleteProcessMemory(pid: ProcessId): void {
    const mem = this.getKmem()
    if (mem.pmem !== undefined) {
      delete mem.pmem[pid]
    }
  }

  public spawnProcessByClassName(processName: string, parentPid?: ProcessId): IProcess | undefined {
    if (parentPid === undefined) { parentPid = 0 }
    const processCtor = ProcessRegistry.fetch(processName)
    if (processCtor === undefined) {
      this.kernelLog(LogLevel.ERROR, 'ClassName not defined')
      return
    }
    return this.spawnProcess(processCtor, parentPid)
  }

  public spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(
    processCtor: MetaProcessCtor<TPROCESS, TCPROC>,
    parentPid: ProcessId
  ): TPROCESS {
    const pid = this.getFreePid()
    const process = (new processCtor(this, pid, parentPid)) as TCPROC
    const record: KernelRecord = {
      process,
      heat: process.baseHeat,
      service: process.service,
      processCtor
    }
    this.processTable.set(pid, record) // TODO: Replace with js object
    return process
  }

  public addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS {
    this.processTable.set(process.pid, {
      heat: process.baseHeat,
      process,
      processCtor: ProcessRegistry.fetch(process.className), // TODO: ".constructor"?
      service: process.service
    } as KernelRecord)
    return process
  }

  // TODO: Child tracking
  public getChildProcesses(parentPid: ProcessId): ProcessId[] {
    const childPids: ProcessId[] = []
    const records = Array.from(this.processTable.values())
    for (let i = 0, n = records.length; i < n; ++i) {
      const record = records[i]
      if (record.process.parentPid === parentPid) {
        childPids.push(record.process.pid)
      }
    }
    return childPids
  }

  public getProcessesByClass(constructor: ProcessConstructor): IProcess[] {
    const processes: IProcess[] = []
    const records = Array.from(this.processTable.values())
    for (let i = 0, n = records.length; i < n; ++i) {
      const record = records[i]
      if (record.process instanceof constructor) {
        processes.push(record.process)
      }
    }
    return processes
  }

  public getProcessesByClassName(className: string): IProcess[] {
    const processCtor = ProcessRegistry.fetch(className)
    if (processCtor === undefined) {
      this.kernelLog(LogLevel.ERROR, `ClassName ${className} not defined`)
      return []
    }
    return this.getProcessesByClass(processCtor)
  }

  public killProcess(processId: ProcessId): void {
    const process = this.getProcessById(processId)
    if (process === undefined) { return }
    this.processTable.delete(processId)
    this.deleteProcessMemory(processId)

    const childPids = this.getChildProcesses(processId)
    for (let i = 0, n = childPids.length; i < n; ++i) {
      const childPid = childPids[i]
      this.killProcess(childPid)
    }
  }

  public getProcessById<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS | undefined {
    const record = this.processTable.get(pid)
    if (record !== undefined) {
      return record.process as TPROCESS
    } else {
      return
    }
  }

  public getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS {
    const record = this.processTable.get(pid)
    if (record === undefined) { throw new Error('Process not found!') }
    return record.process as TPROCESS
  }

  public run(maxCpu: number): void {
    const processes = new Array<KernelRecord>()
    // TODO: Optimize into two process tables, and differentiate service from process
    for (const record of this.processTable.values()) {
      // TODO: build into a heap while adding to quickly sort?
      processes.push(record)
    }

    processes.sort(this.sortKernelRecordsByHeat)
    this.runAllProcesses(processes, maxCpu)
  }

  private loadProcessEntry(entry: SerializedProcess): KernelRecord | null {
    const pctor = ProcessRegistry.fetch(entry.ex)
    if (pctor === undefined) {
      console.log(`Error: No constructor found for executable "${entry.ex}"!`)
      return null
    }
    return {
      process: new pctor(this, entry.id, entry.pa),
      processCtor: pctor,
      heat: entry.he,
      service: entry.se,
    }
  }

  private sortKernelRecordsByHeat(a: KernelRecord, b: KernelRecord): number {
    return b.heat - a.heat
  }

  private tryCallProc(proc: IProcess): Error | undefined {
    try { proc.run(); return } catch (er) { return er }
  }

  private tryRunProc(process: IProcess): number {
    const e = this.tryCallProc(process)
    if (e !== undefined) {
      this.kernelLog(LogLevel.ERROR, `Failed to run service ${process.pid}:${process.className}: ${e}`)
      const stackTrace = e.stack
      if (stackTrace) { this.kernelLog(LogLevel.ERROR, 'Stack Trace:\n' + stackTrace.toString()) }
      return -1
    }
    if (process.status !== ProcessStatus.RUN) {
      return -2 // Exit code
    }
    return 0
  }

  private runAllProcesses(processes: KernelRecord[], maxCpu: number): void {
    let overheat: boolean = false
    let i: number = 0
    const n = processes.length

    for (; i < n; ++i) {
      // TODO: Add reload warmup period
      // TODO: Add moving-average estimation for process duration
      if (Game.cpu.getUsed() >= maxCpu) {
        overheat = true
        break
      }
      const record = processes[i]
      const process = record.process
      record.heat = process.baseHeat

      if (this.tryRunProc(process) === -2) {
        this.killProcess(process.pid)
        this.kernelLog(LogLevel.INFO, `Process ${process.pid}:${process.className} exited with status ${process.status}.`)
        continue
      }
    }
    if (overheat) {
      for (; i < n; ++i) {
        const record = processes[i]
        record.heat = record.heat + record.process.baseHeat
      }
    }
  }
}

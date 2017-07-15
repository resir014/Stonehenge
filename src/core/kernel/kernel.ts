/*
 * Copyright (c) 2016 Dessix.
 *
 * Original code here: https://github.com/Dessix/Primal/blob/master/src/kernel/kernel.ts
 */

import * as Config from '../../config/config'
import { log } from '../../lib/logger'
import { ProcessRegistry } from './processRegistry'

interface KernelRecord {
  heat: number
  processCtor: ProcessConstructor
  process: IProcess
}

/**
 * Just like an actual OS kernel, a Kernel controls all of the processes
 * happening in our Screeps codebase. It manages the tasks of the processes and the
 * in-game objects - most notably memory and CPU time.
 *
 * @export
 * @class Kernel
 * @implements {IKernel}
 */
export class Kernel implements IKernel {
  /**
   * Maximum PID before looping back.
   *
   * @static
   * @type {number}
   * @memberof Kernel
   */
  public static readonly PID_MAX: number = 1E6
  /**
   * At which point do we warn at the number remaining
   *
   * @static
   * @type {number}
   * @memberof Kernel
   */
  public static readonly PID_WARN_LEVEL: number = 1E3
  /**
   * How often do we warn, by creation of new IDs?
   *
   * @static
   * @type {number}
   * @memberof Kernel
   */
  public static readonly PID_WARN_RATE: number = 1E1
  private processTable: (Map<ProcessId, KernelRecord>)
  private readonly kernelSymbol: string = Config.KERNEL_SYMBOL ? Config.KERNEL_SYMBOL : '//'
  private readonly getKmem: () => KernelMemory

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

  public kernelLog(logLevel: LogLevel, message: string): void {
    const mem = this.mem.kpar
    if (!mem.isTest) {
      log.print(logLevel, `[${this.kernelSymbol}] ${message}`)
    }
  }

  public get mem(): KernelMemory & { kpar: KernelParameters } {
    return this.getKmem() as KernelMemory & { kpar: KernelParameters }
  }

  public loadProcessTable(): void {
    const mem = this.getKmem()
    let proc = mem.proc
    if (proc == null) {
      this.kernelLog(LogLevel.INFO, 'Spawning new process table.')
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
    const table: SerializedProcessTable = []
    for (const record of this.processTable.values()) {
      if (record.process.status < ProcessStatus.RUN) {
        continue
      }
      const produced: SerializedProcess = {
        id: record.process.pid,
        pa: record.process.parentPid,
        ex: record.process.className,
        he: record.heat,
      }
      table.push(produced)
    }
    this.getKmem().proc = table
  }

  public getFreePid(): ProcessId {
    const kpar = this.mem.kpar
    const newPid = kpar.nextPid
    const nextPid = newPid + 1
    if (nextPid >= (Kernel.PID_MAX - Kernel.PID_WARN_LEVEL)) {
      if (nextPid >= Kernel.PID_MAX) {
        this.kernelLog(LogLevel.INFO, 'PID Rotation occurred! PID 1 spawns next!')
        kpar.nextPid = 1
      } else {
        kpar.nextPid = nextPid
        if (nextPid % Kernel.PID_WARN_RATE === 0) {
          this.kernelLog(LogLevel.INFO, `PID Rotation in ${Kernel.PID_MAX - nextPid} PIDs.`)
        }
      }
    }
    kpar.nextPid = nextPid
    return newPid as ProcessId
  }

  public reboot(): void {
    this.kernelLog(LogLevel.INFO, 'Rebooting.')
    this.processTable = new Map<ProcessId, KernelRecord>()
    this.applyKMemDefaults(this.getKmem(), true)
    for (const room of Object.values(Game.rooms)) {
      const rmem = room.memory
      if (rmem === undefined) { continue }
      delete rmem.p
      delete rmem.r
    }
    delete Memory.sources
    this.saveProcessTable()
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

  public spawnProcessByClassName(processName: string, parentPid?: ProcessId): ProcInit<IProcess & { init: Function }> | undefined {
    if (parentPid === undefined) { parentPid = 0 }
    const processCtor = ProcessRegistry.fetch(processName)
    if (processCtor === undefined) {
      this.kernelLog(LogLevel.ERROR, 'ClassName not defined')
      return
    }
    return this.spawnProcess(processCtor, parentPid)
  }

  public spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess & { init: Function }>(
    processCtor: MetaProcessCtor<TPROCESS, TCPROC>,
    parentPid: ProcessId
  ): ProcInit<TCPROC> {
    const pid = this.getFreePid()
    const process = (new processCtor(this, pid, parentPid)) as TCPROC
    const record: KernelRecord = {
      process,
      heat: process.baseHeat,
      processCtor
    }
    if (this.processTable.get(pid) !== undefined) {
      // this.kernelLog(LogLevel.ERROR, 'Kernel spawning a duplicate for an occupied PID!')
      throw new Error('Kernel spawning a duplicate for an occupied PID!')
    }
    this.processTable.set(pid, record)
    this.kernelLog(LogLevel.INFO, `Spawned ${process.pid}:${process.className}`)
    return process
  }

  public addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS {
    if (this.processTable.get(process.pid) !== undefined) {
      throw new Error('Kernel spawning a replacement for an occupied PID!')
    }
    this.processTable.set(process.pid, {
      heat: process.baseHeat,
      process,
      processCtor: (this as {} as { constructor: ProcessConstructor<TPROCESS> }).constructor,
    } as KernelRecord)
    return process
  }

  // TODO: Child tracking
  public getChildProcesses(parentPid: ProcessId): ProcessId[] {
    const childPids: ProcessId[] = []
    const records = Array.from(this.processTable.values())
    for (const record of records) {
      if (record.process.parentPid === parentPid) {
        childPids.push(record.process.pid)
      }
    }
    return childPids
  }

  public getProcessesByClass<TPROCESS extends IProcess>(constructor: ProcessConstructor<TPROCESS>): TPROCESS[] {
    const processes: TPROCESS[] = []
    for (const record of this.processTable.values()) {
      if (record.process instanceof constructor) {
        processes.push(record.process)
      }
    }
    return processes
  }

  public getProcessesByClassName<TPROCESS extends IProcess>(className: string): TPROCESS[] {
    const processCtor = ProcessRegistry.fetch(className)
    if (processCtor === undefined) {
      this.kernelLog(LogLevel.ERROR, `ClassName ${className} is not defined`)
      return []
    }
    return this.getProcessesByClass(processCtor) as TPROCESS[]
  }

  public killProcess(processId: ProcessId): void {
    const process = this.getProcessById(processId)
    if (process === undefined) { return }
    this.processTable.delete(processId)
    this.deleteProcessMemory(processId)
    process.status = ProcessStatus.TERM

    this.kernelLog(LogLevel.INFO, `Killing process ${process.pid}:${process.className}`)
    const childPids = this.getChildProcesses(processId)
    for (let i = 0, n = childPids.length; i < n; ++i) {
      const childPid = childPids[i]
      this.killProcess(childPid)
    }
  }

  public getProcessById<TPROCESS extends IProcess>(pid: ProcessId | undefined): TPROCESS | undefined {
    let retVal
    if (pid !== undefined) {
      const record = this.processTable.get(pid)
      if (record !== undefined && record.process.status >= ProcessStatus.RUN) {
        retVal = record.process as TPROCESS
      }
    }
    return retVal
  }

  public getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS {
    const record = this.processTable.get(pid)
    if (record === undefined) { throw new Error('Process not found!') }
    return record.process as TPROCESS
  }

  public run(maxCpu: number): void {
    const processes = new Array<KernelRecord>()
    for (const record of this.processTable.values()) {
      // TODO: build into a heap while adding to quickly sort?
      if (record.process.status >= ProcessStatus.RUN) {
        processes.push(record)
      }
    }

    processes.sort(this.sortKernelRecordsByHeat)
    this.runAllProcesses(processes, maxCpu)
  }

  private applyKMemDefaults(kmem: KernelMemory, reset: boolean = false): KernelMemory & { kpar: KernelParameters } | undefined {
    if (reset) {
      let nextPidStart: number = 1
      if (kmem.kpar && kmem.kpar.nextPid !== undefined) {
        nextPidStart = kmem.kpar.nextPid
      }
      kmem.pmem = {}
      kmem.proc = []
      kmem.kpar = { nextPid: nextPidStart }

      return kmem as KernelMemory & { kpar: KernelParameters }
    }
    if (kmem.kpar == null) {
      kmem.kpar = {
        nextPid: 1,
      }
    } else if (kmem.kpar.nextPid === undefined) {
      kmem.kpar.nextPid = 1
    }
    if (kmem.pmem == null) {
      kmem.pmem = {}
    }
    if (kmem.proc == null) {
      this.kernelLog(LogLevel.INFO, 'Spawning new process table')
      kmem.proc = []
    }
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
    }
  }

  private sortKernelRecordsByHeat(a: KernelRecord, b: KernelRecord): number {
    return b.heat - a.heat
  }

  private tryCallProc(proc: IProcess): Error | undefined {
    try { proc.run(); return } catch (er) { return er }
  }

  private tryRunProc(process: IProcess): number {
    const pid = process.pid
    if (this.getProcessById(process.parentPid) === undefined) {
      this.kernelLog(LogLevel.INFO, `Parent process doesn't exist for ${process.pid}:${process.className}; deregistering from kernel.`)
      process.status = ProcessStatus.EXIT
      return ProcessStatus.TERM
    }
    const e = this.tryCallProc(process)
    if (e !== undefined) {
      this.kernelLog(LogLevel.DEBUG, `Dying process ${pid}'s memory was:\n${JSON.stringify(this.getProcessMemory(pid))}`)
      const stackTrace = e.stack
      if (stackTrace) { this.kernelLog(LogLevel.ERROR, 'Stack Trace:\n' + stackTrace.toString()) }
      return ProcessStatus.TERM
    }
    if (process.status < ProcessStatus.RUN) {
      return process.status
    }
    return ProcessStatus.RUN
  }

  private static processStatusToString(status: ProcessStatus): string {
    switch (status) {
      case ProcessStatus.RUN: return 'RUN'
      case ProcessStatus.EXIT: return 'EXIT'
      case ProcessStatus.TERM: return 'TERM'
      default: throw new Error('Unrecognized status')
    }
  }

  private runAllProcesses(processes: KernelRecord[], maxCpu: number): void {
    // 'i' and 'n' are declared outside the loop for access in overheat phase below
    let i: number = 0
    const n = processes.length
    for (; i < n; ++i) {
      if (Game.cpu.getUsed() >= maxCpu) {
        // Remaining processes will receive heat due to CPU limit
        break
      }

      // TODO: Add duration estimation by proctype with rolling-average and burst magnitude, to reduce overages
      const record = processes[i]
      const process = record.process
      record.heat = process.baseHeat

      // Skip processes which have been killed earlier this tick
      if (process.status < ProcessStatus.RUN) { continue }

      // this.kLog(LogLevel.Debug, `Running process ${process.pid}:${process.classPath}`);
      if (this.tryRunProc(process) === ProcessStatus.TERM) {
        this.killProcess(process.pid)
        this.kernelLog(
          LogLevel.INFO,
          `Process ${process.pid}:${process.classPath} exited with status
          ${Kernel.processStatusToString(process.status)}(${process.status}).`
        )
        continue
      }
    }
    if (i < n) {
      // 'i' remains at the last used position before we broke execution- heat those that remain
      for (; i < n; ++i) {
        const record = processes[i]
        if (record.process.status >= ProcessStatus.RUN) {
          record.heat = record.heat + record.process.baseHeat
        }
      }
    }
  }
}

/* tslint:disable */

/*
 * Copyright (c) 2016 Dessix.
 *
 * Original code here: https://github.com/Dessix/Primal/blob/master/src/kernel/kernel.ts
 */

// import * as Config from '../../config/config'
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
  readonly kernelSymbol = "\u{1F53B}";
  private processTable: (Map<ProcessId, KernelRecord>);
  private readonly getKmem: () => KernelMemory;

  //TODO: Accept log sources via an optional kvp-set parameter to allow StaticLogger to format
  public log(logLevel: LogLevel, message: string): void {
    log.print(logLevel, `[${this.kernelSymbol}] ${message}`)
  }

  public kLog(logLevel: LogLevel, message: string): void {
    const mem = this.mem.kpar
    if (!mem.isTest) {
      log.print(logLevel, `[${this.kernelSymbol}] ${message}`)
    }
  }

  public logError<TErr extends Error>(err: TErr): TErr {
    log.print(LogLevel.ERROR, `${err}\n${err.stack}`);
    return err;
  }

  private kLogError<TErr extends Error = Error>(err: TErr | string): TErr {
    let e: TErr;
    if(typeof err == "string") {
      e = <TErr>(new Error(<string>err));
    } else {
      e = err;
    }
    e.message = `[${this.kernelSymbol}] ${e.message}`;
    return this.logError(e);
  }

  public get mem(): KernelMemory & { kpar: KernelParameters } {
    return this.applyKMemDefaults(this.getKmem(), false);
  }

  private applyKMemDefaults(kmem: KernelMemory, reset: boolean = false) {
    if(reset) {
      let nextPidStart = 1;
      if(kmem.kpar && kmem.kpar.nextPid !== undefined) {
        nextPidStart = kmem.kpar.nextPid;
      }
      kmem.pmem = {};
      kmem.proc = [];
      kmem.kpar = { nextPid: nextPidStart };
      return <KernelMemory & { kpar: KernelParameters }>kmem;
    }
    if(kmem.kpar == null) {
      kmem.kpar = {
        nextPid: 1,
      };
    } else if(kmem.kpar.nextPid === undefined) {
      kmem.kpar.nextPid = 1;
    }
    if(kmem.pmem == null) {
      kmem.pmem = {};
    }
    if(kmem.proc == null) {
      this.kLog(LogLevel.INFO, "Spawning new process table")
      kmem.proc = [];
    }
    return <KernelMemory & { kpar: KernelParameters }>kmem;
  }

  public constructor(fetchKmem: () => KernelMemory) {
    this.processTable = new Map<ProcessId, KernelRecord>();
    this.getKmem = fetchKmem;
    this.applyKMemDefaults(fetchKmem());
  }

  private loadProcessEntry(entry: SerializedProcess): KernelRecord | null {
    const pctor = ProcessRegistry.fetch(entry.ex);
    if(pctor === undefined) {
      this.kLogError(`No constructor found for executable "${entry.ex}"!`);
      return null;
    }
    return {
      process: new pctor(this, entry.id, entry.pa),
      processCtor: pctor,
      heat: entry.he,
    };
  }

  public loadProcessTable(): void {
    const mem = this.getKmem();
    this.processTable.clear();
    let proc = mem.proc;
    if(proc == null) {
      this.kLog(LogLevel.INFO, "Spawning new process table")
      mem.proc = proc = [];
    } else {
      for(let i = 0, n = proc.length; i < n; ++i) {
        const entry = proc[i];
        const record = this.loadProcessEntry(entry);
        if(record !== null) {
          this.processTable.set(entry.id, record);
        }
      }
    }
    for(let pidStr of Object.keys(mem.pmem)) {
      const pid = <ProcessId><any>parseInt(pidStr);
      if(!this.processTable.get(pid)) {
        this.kLog(LogLevel.DEBUG, `Clearing zombie process memory for dead process ${pidStr}`)
        this.deleteProcessMemory(pid);
      }
    }
  }

  public saveProcessTable(): void {
    const table: SerializedProcessTable = [];
    for(let record of this.processTable.values()) {
      if(record.process.status < ProcessStatus.RUN) {
        continue;
      }
      const produced: SerializedProcess = {
        id: record.process.pid,
        pa: record.process.parentPid,
        ex: record.process.className,
        he: record.heat,
      };
      table.push(produced);
    }
    this.getKmem().proc = table;
  }

  public static readonly PID_MAX = 1E6;// Max PID before looping back
  public static readonly PID_WARN_LEVEL = 1E3;// At which point do we warn at the number remaining
  public static readonly PID_WARN_RATE = 1E1;// How often do we warn, by creation of new IDs?
  public getFreePid(): ProcessId {
    const kpar = this.mem.kpar;
    const newPid = kpar.nextPid;
    const nextPid = newPid + 1;
    if(nextPid >= (Kernel.PID_MAX - Kernel.PID_WARN_LEVEL)) {
      if(nextPid >= Kernel.PID_MAX) {
        this.kLog(LogLevel.INFO, "PID Rotation occurred! PID 1 spawns next!");
        kpar.nextPid = 1;
      } else {
        kpar.nextPid = nextPid;
        if(nextPid % Kernel.PID_WARN_RATE === 0) {
          this.kLog(LogLevel.INFO, `PID Rotation in ${Kernel.PID_MAX - nextPid} PIDs.`);
        }
      }
    }
    kpar.nextPid = nextPid;
    return <ProcessId><any>(newPid);
  }

  public reboot(): void {
    this.kLog(LogLevel.INFO, "Rebooting...");
    this.processTable = new Map<ProcessId, KernelRecord>();
    this.applyKMemDefaults(this.getKmem(), true);
    for(let room of _.values(Game.rooms)) {
      const rmem = Memory.rooms[(room as Room).name];
      if(rmem === undefined) { continue; }
      delete rmem.r;
    }
    delete Memory.sources;
    delete Memory.colony;
    this.saveProcessTable();
  }

  public getProcessCount(): number {
    return this.processTable.size;
  }

  public getProcessMemory(processId: ProcessId): ProcessMemory {
    const mem = this.getKmem();
    let pmem = mem.pmem;
    if(pmem === undefined) { mem.pmem = pmem = {}; }
    let pmemi = pmem[<number><any>processId];
    if(pmemi === undefined || pmemi === null) { pmem[<number><any>processId] = pmemi = {}; }
    return pmemi;
  }

  public setProcessMemory(pid: ProcessId, memory: ProcessMemory): void {
    const mem = this.getKmem();
    let pmem = mem.pmem;
    if(pmem === undefined) { mem.pmem = pmem = {}; }
    pmem[<number><any>pid] = memory;
  }

  public deleteProcessMemory(pid: ProcessId): void {
    const mem = this.getKmem();
    if(mem.pmem !== undefined) {
      delete mem.pmem[<number><any>pid];
    }
  }

  public spawnProcessByClassName(processName: string, parentPid?: ProcessId): ProcInit<IProcess & { init: Function }> | undefined {
    if(parentPid === undefined) { parentPid = <ProcessId><any>0; }
    const processCtor = ProcessRegistry.fetch(processName);
    if(processCtor === undefined) {
      this.kLogError("ClassName not defined");
      return;
    }
    return this.spawnProcess(processCtor, parentPid);
  }

  public spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess & { init: Function }>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>, parentPid: ProcessId): ProcInit<TCPROC> {
    const pid = this.getFreePid();
    const process = <TCPROC>(new processCtor(this, pid, parentPid));
    const record: KernelRecord = {
      process: process,
      heat: process.baseHeat,
      processCtor: processCtor,
    };
    if(this.processTable.get(pid) !== undefined) {
      throw this.kLogError(new Error("Kernel spawning a duplicate for an occupied PID!"));
    }
    this.processTable.set(pid, record);
    this.kLog(LogLevel.INFO, `Spawned ${process.pid}:${process.classPath}`);
    return process;
  }

  public addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS {
    if(this.processTable.get(process.pid) !== undefined) {
      throw this.kLogError(new Error("Kernel spawning a replacement for an occupied PID!"));
    }
    this.processTable.set(process.pid, <KernelRecord>{
      heat: process.baseHeat,
      process: process,
      processCtor: (<{ constructor: ProcessConstructor<TPROCESS>; }><{}>this).constructor,
    });
    return process;
  }

  public reparent(process: IProcess, newParent: IProcess): void {
    const entry = this.processTable.get(process.pid)!;
    //TODO: Hack
    (<any>(entry.process)).parentPid = newParent.pid;
  }

  //TODO: Child tracking
  public getChildProcesses(parentPid: ProcessId): ProcessId[] {
    const childPids: ProcessId[] = [];
    const records = Array.from(this.processTable.values());
    for(let i = 0, n = records.length; i < n; ++i) {
      const record = records[i];
      if(record.process.parentPid === parentPid) {
        childPids.push(record.process.pid);
      }
    }
    return childPids;
  }

  public getProcessesByClass<TPROCESS extends IProcess>(constructor: ProcessConstructor<TPROCESS>): TPROCESS[] {
    const processes: TPROCESS[] = [];
    for(let record of this.processTable.values()) {
      if(record.process instanceof constructor) {
        processes.push(record.process);
      }
    }
    return processes;
  }

  public getProcessesByClassName<TPROCESS extends IProcess>(className: string): TPROCESS[] {
    const processCtor = ProcessRegistry.fetch(className);
    if(processCtor === undefined) {
      this.kLogError(`ClassName ${className} is not defined`);
      return [];
    }
    return <TPROCESS[]>this.getProcessesByClass(processCtor);
  }

  private isIProcess(processIdOrProcess: ProcessId | IProcess): processIdOrProcess is IProcess {
    const tpe = typeof processIdOrProcess;
    return !(tpe === "string" || tpe === "number");
  }

  public killProcess(processIdOrProcess: ProcessId | IProcess | undefined): void {
    if (processIdOrProcess === undefined) { return; }
    const processId = this.isIProcess(processIdOrProcess) ? processIdOrProcess.pid : processIdOrProcess;
    this.deleteProcessMemory(processId);
    const process = this.getProcessById(processId);
    if(process === undefined) { return; }
    this.processTable.delete(processId);
    process.status = ProcessStatus.TERM;

    this.kLog(LogLevel.INFO, `Killing process ${process.pid}:${process.className}`);
    const childPids = this.getChildProcesses(processId);
    for(let i = 0, n = childPids.length; i < n; ++i) {
      const childPid = childPids[i];
      this.killProcess(childPid);
    }
  }

  public getProcessById<TPROCESS extends IProcess>(pid: ProcessId | undefined): TPROCESS | undefined {
    let retVal = undefined;
    if(pid !== undefined) {
      const record = this.processTable.get(pid);
      if(record !== undefined && record.process.status >= ProcessStatus.RUN) {
        retVal = <TPROCESS>record.process;
      }
    }
    return retVal;
  }

  public getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS {
    const record = this.processTable.get(pid);
    if(record === undefined || record.process.status < ProcessStatus.RUN) {
      throw new Error("Process not found!");
    }
    return <TPROCESS>record.process;
  }

  private sortKernelRecordsByHeat(a: KernelRecord, b: KernelRecord): number {
    return b.heat - a.heat;
  }

  private tryCallProc(proc: IProcess): Error | undefined {
    try { proc.run.call(proc); return; } catch(er) { return er; }
  }

  private tryRunProc(process: IProcess): ProcessStatus {
    const pid = process.pid;
    if(this.getProcessById(process.parentPid) === undefined) {
      this.kLog(LogLevel.INFO, `Parent process doesn't exist for ${process.pid}:${process.className}; deregistering from kernel.`);
      process.status = ProcessStatus.EXIT;
      return ProcessStatus.TERM;
    }
    const e = this.tryCallProc(process);
    if(e !== undefined) {
      this.kLog(LogLevel.DEBUG, `Dying process ${pid}'s memory was:\n${JSON.stringify(this.getProcessMemory(pid))}`);
      this.logError(e);
      return ProcessStatus.TERM;
    }
    if(process.status < ProcessStatus.RUN) {
      return process.status;
    }
    return ProcessStatus.RUN;
  }

  private static processStatusToString(status: ProcessStatus): string {
    switch(status) {
      case ProcessStatus.RUN: return "RUN";
      case ProcessStatus.EXIT: return "EXIT";
      case ProcessStatus.TERM: return "TERM";
      default: throw new Error("Unrecognized status");
    }
  }

  private runAllProcesses(processes: KernelRecord[], maxCpu: number): void {
    // 'i' and 'n' are declared outside the loop for access in overheat phase below
    let i: number = 0, n = processes.length;
    for(; i < n; ++i) {
      if(Game.cpu.getUsed() >= maxCpu) {
        // Remaining processes will receive heat due to CPU limit
        break;
      }

      //TODO: Add duration estimation by proctype with rolling-average and burst magnitude, to reduce overages
      const record = processes[i], process = record.process;
      record.heat = process.baseHeat;

      // Skip processes which have been killed earlier this tick
      if(process.status < ProcessStatus.RUN) {
        this.deleteProcessMemory(process.pid);
        continue;
      }

      // this.kLog(LogLevel.Debug, `Running process ${process.pid}:${process.classPath}`);
      if(this.tryRunProc(process) < ProcessStatus.RUN) {
        this.killProcess(process.pid);
        if(typeof process.pid !== "number") { throw new Error("PID of incorrect type"); }
        this.kLog(LogLevel.INFO, `Process ${process.pid}:${process.classPath} exited with status ${Kernel.processStatusToString(process.status)}(${process.status}).`);
        continue;
      }
    }
    if(i < n) {
      // 'i' remains at the last used position before we broke execution- heat those that remain
      for(; i < n; ++i) {
        const record = processes[i];
        if(record.process.status >= ProcessStatus.RUN) {
          record.heat = record.heat + record.process.baseHeat;
        }
      }
    }
  }

  public run(maxCpu: number): void {
    const processes = new Array<KernelRecord>();
    for(let record of this.processTable.values()) {
      //TODO: build into a heap while adding to quickly sort?
      if(record.process.status >= ProcessStatus.RUN) {
        processes.push(record);
      }
    }
    processes.sort(this.sortKernelRecordsByHeat);
    this.runAllProcesses(processes, maxCpu);
  }
}

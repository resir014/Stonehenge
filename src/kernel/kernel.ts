import { Process } from './process'
import { ProcessRegistry } from './processRegistry'

class Kernel implements IKernel {
  public processTable: { [pid: string]: Process } = {}

  private highPriorityQueue: Process[] = []
  private midPriorityQueue: Process[] = []
  private lowPriorityQueue: Process[] = []

  public reboot(): void {
    this.highPriorityQueue = []
    this.midPriorityQueue = []
    this.lowPriorityQueue = []
    this.processTable = {}
  }

  public garbageCollection(): void {
    Memory.processMemory = _.pick(Memory.processMemory, (_: any, k: string) => (this.processTable[k]))
  }

  public addProcess<T extends Process>(p: T, priority: ProcessPriority = ProcessPriority.LOW): T {
    const pid = this.getFreePid();
    p.pid = pid
    p.priority = priority
    this.processTable[p.pid] = p

    // Set process memory + status.
    Memory.processMemory[pid] = {}
    p.setMemory(this.getProcessMemory(pid))
    p.status = ProcessStatus.ALIVE
    return p
  };

  public killProcess(pid: number): number {
    if (pid === 0) {
      console.log('ABORT! ABORT! Why are you trying to kill init?!')
      return -1
    }
    this.processTable[pid].status = ProcessStatus.DEAD
    Memory.processMemory[pid] = undefined

    // When a process is killed, we also need to kill all of its child processes
    console.log('Shutting down process with pid:' + pid)
    for (const otherPid in this.processTable) {
      const process = this.processTable[pid]

      if ((process.parentPid === parseInt(otherPid, 10)) &&
        (process.status !== ProcessStatus.DEAD)) {
        this.killProcess(process.pid)
      }
    }
    return pid
  }

  public sleepProcess = (p: Process, ticks: number) => {
    p.status = ProcessStatus.SLEEP;
    p.sleepInfo = { start: Game.time, duration: ticks };
    return p;
  }

  public getProcessById(pid: number): Process {
    return this.processTable[pid];
  };

  public storeProcessTable(): void {
    const aliveProcess = _.filter(_.values(this.processTable), (p: Process) => p.status !== ProcessStatus.DEAD);

    Memory.processTable = _.map(aliveProcess, (p: Process) => [p.pid, p.parentPID, p.classPath(), p.priority, p.sleepInfo]);
  };

  public getProcessMemory(pid: number): ProcessMemory {
    Memory.processMemory = Memory.processMemory || {};
    Memory.processMemory[pid] = Memory.processMemory[pid] || {};
    return Memory.processMemory[pid];
  };

  public run(): void {
    this.runOneQueue(this.highPriorityQueue);
    this.runOneQueue(this.midPriorityQueue);
    this.runOneQueue(this.lowPriorityQueue);
  };

  public loadProcessTable(): void {
    this.reboot();
    Memory.processTable = Memory.processTable || [];
    const storedTable = Memory.processTable;

    for (const item of storedTable) {
      const { pid, parentPID, className, priority, ...remaining }: ProcessTable = item;
      try {
        // Load the process constructor from the registry
        const pctor: ProcessConstructor | undefined = ProcessRegistry.fetch(className);
        if (!pctor) {
          // Throw an error if we can't find our constructor
          throw new Error('Unable to find process constructor')
        }

        const memory = this.getProcessMemory(pid);
        const p = new pctor(this, pid, parentPID, priority);
        p.setMemory(memory);
        this.processTable[p.pid] = p;
        const sleepInfo = remaining.pop();
        if (sleepInfo) {
          p.sleepInfo = sleepInfo;

          p.status = ProcessStatus.SLEEP;
        }
        if (priority === ProcessPriority.HIGH) {
          this.highPriorityQueue.push(p);
        }

        if (priority === ProcessPriority.MID) {
          this.midPriorityQueue.push(p);
        }

        if (priority === ProcessPriority.LOW) {
          this.lowPriorityQueue.push(p);
        }
      } catch (e) {
        console.log('Error when loading:' + e.message);
        console.log(className);
      }
    }
  }

  private getFreePid(): number {
    Memory.pidCounter = Memory.pidCounter || 0
    while (this.getProcessById(Memory.pidCounter)) {
      Memory.pidCounter += 1
    }
    return Memory.pidCounter
  }

  private runOneQueue(queue: Process[]): void {
    while (queue.length > 0) {
      let process = queue.pop()
      while (process) {
        try {
          const parent = this.getProcessById(process.parentPid)
          if (!parent) {
            this.killProcess(process.pid)
          }

          if ((process.status === ProcessStatus.SLEEP) &&
            ((process.sleepInfo!.start + process.sleepInfo!.duration) < Game.time) &&
            (process.sleepInfo!.duration !== -1)) {
            process.status = ProcessStatus.ALIVE
            process.sleepInfo = undefined
          }

          if (process.status === ProcessStatus.ALIVE) {
            process.run()
          }
        } catch (e) {
          console.log('Fail to run process:' + process.pid)
          console.log(e.message)
          console.log(e.stack)
        }

        process = queue.pop()
      }
    }

  }
}

export default Kernel

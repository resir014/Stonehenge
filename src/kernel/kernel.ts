import { Process } from './process'
import { ProcessRegistry } from './processRegistry'

export let processTable: { [pid: number]: KernelRecord }

let highPriorityQueue: Process[] = []
let midPriorityQueue: Process[] = []
let lowPriorityQueue: Process[] = []

export const reboot = () => {
  highPriorityQueue = []
  midPriorityQueue = []
  lowPriorityQueue = []
  processTable = {}
}

const getFreePid = () => {
  Memory.pidCounter = Memory.pidCounter || 0
  while (getProcessById(Memory.pidCounter)) {
    Memory.pidCounter += 1
  }
  return Memory.pidCounter
};

export const garbageCollection = () => {
  Memory.processMemory = _.pick(Memory.processMemory, (_: any, k: number) => (processTable[k]))
}

export const addProcess = <T extends IProcess>(process: T, priority: ProcessPriority = ProcessPriority.LOW): T => {
  const pid = getFreePid()
  process.pid = pid
  process.priority = priority
  processTable[pid] = {
    priority,
    process,
    processCtor: ProcessRegistry.fetch(process.className),
    status: ProcessStatus.ALIVE
  } as KernelRecord

  Memory.processMemory[pid] = {}
  process.setMemory(getProcessMemory(pid))
  process.status = ProcessStatus.ALIVE
  /*const pid = getFreePid()
  p.pid = pid
  p.priority = priority
  processTable[p.pid] = p
  Memory.processMemory[pid] = {}
  p.setMemory(getProcessMemory(pid))
  p.status = ProcessStatus.ALIVE
  return p*/

  return process
};

export const killProcess = (pid: number) => {
  if (pid === 0) {
    console.log('ABORT! ABORT! Why are you trying to kill init?!')
    return -1
  }
  // const process = getProcessById(pid)
  // if (process === undefined) console.log(`Unable to kill PID ${pid}: That process ID desn't exist`)
  processTable[pid].status = ProcessStatus.DEAD
  Memory.processMemory[pid] = undefined

  // When a process is killed, we also need to kill all of its child processes
  console.log('Shutting down process with pid:' + pid)
  for (const otherPid in processTable) {
    const process = processTable[pid].process as IProcess

    if ((process.parentPid === parseInt(otherPid, 10)) &&
      (process.status !== ProcessStatus.DEAD)) {
      killProcess(process.pid)
    }
  }
  return pid
}

export const sleepProcess = (p: Process, ticks: number) => {
  p.status = ProcessStatus.SLEEP
  p.sleepInfo = { start: Game.time, duration: ticks }
  return p
}

export const getProcessById = <T extends Process>(pid: number): T | undefined => {
  const record = processTable[pid]

  if (record !== undefined) {
    return record.process as T
  }
}

export const storeProcessTable = () => {
  const aliveProcess = _.filter(processTable, (p: ProcessTable) => p.status !== ProcessStatus.DEAD)

  Memory.processTable = aliveProcess
}

export const getProcessMemory = function (pid: number): ProcessMemory {
  Memory.processMemory = Memory.processMemory || {}
  Memory.processMemory[pid] = Memory.processMemory[pid] || {}
  return Memory.processMemory[pid]
};

export const run = () => {
  runOneQueue(highPriorityQueue);
  runOneQueue(midPriorityQueue);
  runOneQueue(lowPriorityQueue);
};

export const loadProcessTable = () => {
  reboot();
  Memory.processTable = Memory.processTable || []
  const storedTable = Memory.processTable

  for (const item of storedTable) {
    const { priority, process, processCtor, sleepInfo }: KernelRecord = item
    const className = process.className

    try {
      if (!processCtor) {
        // Throw an error if we can't find our constructor
        throw new Error('Unable to find process constructor')
      }

      const pid: number = process.pid
      const parentPid: number = process.parentPid

      const memory = getProcessMemory(pid)
      const p = new processCtor(pid, parentPid, priority)
      p.setMemory(memory)
      processTable[p.pid] = item

      if (sleepInfo) {
        p.sleepInfo = sleepInfo
        p.status = ProcessStatus.SLEEP
      }
      if (priority === ProcessPriority.HIGH) {
        highPriorityQueue.push(p as Process)
      }

      if (priority === ProcessPriority.MID) {
        midPriorityQueue.push(p as Process)
      }

      if (priority === ProcessPriority.LOW) {
        lowPriorityQueue.push(p as Process)
      }
    } catch (e) {
      console.log('Error when loading:' + e.message)
      console.log(className)
    }
  }
}

const runOneQueue = (queue: Process[]) => {
  while (queue.length > 0) {
    let process = queue.pop()
    while (process) {
      try {
        const parent = getProcessById(process.parentPid)
        if (!parent) {
          killProcess(process.pid)
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

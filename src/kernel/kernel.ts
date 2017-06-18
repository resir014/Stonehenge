import { Process } from './process'
import { ProcessRegistry } from './processRegistry'

export let processTable: Map<number, KernelRecord> = new Map<number, KernelRecord>()

let highPriorityQueue: Process[] = []
let midPriorityQueue: Process[] = []
let lowPriorityQueue: Process[] = []

export const reboot = () => {
  console.log('[Kernel.reboot()] start')
  highPriorityQueue = []
  midPriorityQueue = []
  lowPriorityQueue = []
  processTable = new Map<number, KernelRecord>()
  console.log('[Kernel.reboot()] end')
}

const getFreePid = () => {
  console.log(`[Kernel.getFreePid()] start`)
  Memory.pidCounter = Memory.pidCounter || 0
  const currentPids = Array.from(processTable.keys()).sort()
  for (let i = 0; i < currentPids.length; ++i) {
    if (currentPids[i] !== i) {
      return i;
    }
  }
  const currentPid = currentPids.length
  Memory.pidCounter = currentPid
  console.log(`[Kernel.getFreePid()] end (currentPid: ${currentPid})`)
  return Memory.pidCounter
}

export const garbageCollection = () => {
  Memory.processMemory = _.pick(Memory.processMemory, (_: any, k: number) => (processTable[k]))
}

export const addProcess = <T extends IProcess>(process: T, priority: ProcessPriority = ProcessPriority.LOW): T => {
  console.log('[Kernel.addProcess()] start')
  const pid = getFreePid()
  console.log(`[Kernel.addProcess()] pid: ${pid}`)
  process.pid = pid
  console.log(`[Kernel.addProcess()] process.pid: ${process.pid}`)
  process.priority = priority
  console.log(`[Kernel.addProcess()] process.priority: ${process.priority}`)
  processTable.set(pid, {
    priority,
    process,
    processCtor: ProcessRegistry.fetch(process.className),
    status: ProcessStatus.ALIVE
  } as KernelRecord)
  console.log(`[Kernel.addProcess()] processTable: ${JSON.stringify(processTable.get(pid))}`)

  Memory.processMemory[pid] = Memory.processMemory[pid] || {}
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

  console.log('[Kernel.addProcess()] end')
  return process
};

export const killProcess = (pid: number) => {
  if (pid === 0) {
    console.log('ABORT! ABORT! Why are you trying to kill init?!')
    return
  }
  // First, kill the process constructor.
  const process = getProcessById(pid)
  if (process === undefined) {
    console.log(`Unable to kill PID ${pid}: That process ID desn't exist`)
    return
  }
  processTable.get(pid).status = ProcessStatus.DEAD
  Memory.processMemory[pid] = undefined

  // When a process is killed, we also need to kill all of its child processes
  console.log('Shutting down process with pid:' + pid)
  for (const otherPid in processTable) {
    const childProcess = processTable[pid].process as IProcess

    if ((childProcess.parentPid === parseInt(otherPid, 10)) && (childProcess.status !== ProcessStatus.DEAD)) {
      killProcess(childProcess.pid)
    }
  }
}

export const sleepProcess = (p: Process, ticks: number) => {
  p.status = ProcessStatus.SLEEP
  p.sleepInfo = { start: Game.time, duration: ticks }
  return p
}

export const getProcessById = <T extends Process>(pid: number): T | undefined => {
  console.log(`[Kernel.getProcessById()] start`)
  const record = processTable[pid]
  console.log(`[Kernel.getProcessById()] record: ${record}`)

  if (record !== undefined) {
    console.log(`[Kernel.getProcessById()] end`)
    return record.process as T
  }
  console.log(`[Kernel.getProcessById()] end`)
}

export const storeProcessTable = () => {
  const aliveProcess = _.filter(processTable, (p: ProcessTable) => p.status !== ProcessStatus.DEAD)

  Memory.processTable = aliveProcess
}

export const getProcessMemory = function (pid: number): ProcessMemory {
  Memory.processMemory = Memory.processMemory || {}
  Memory.processMemory[pid] = Memory.processMemory[pid] || {}
  return Memory.processMemory[pid]
}

export const run = () => {
  runOneQueue(highPriorityQueue)
  runOneQueue(midPriorityQueue)
  runOneQueue(lowPriorityQueue)
}

export const loadProcessTable = () => {
  console.log('[Kernel.loadProcessTable()] start')
  reboot()
  Memory.processTable = Memory.processTable || []
  const storedTable = Memory.processTable
  console.log(`[Kernel.loadProcessTable()] storedTable: ${storedTable}`)

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

  console.log('[Kernel.loadProcessTable()] end')
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

interface ProcessMemory {
  [pid: number]: any
}

interface ProcessTable {
  pid: number
  parentPid: number
  className: string
  priority: ProcessPriority
  [key: string]: any
}

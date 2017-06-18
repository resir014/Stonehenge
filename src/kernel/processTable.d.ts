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

interface SerializedProcess {
  /**
   * Process ID.
   *
   * @type {number}
   * @memberof SerializedProcess
   */
  id: number
  /**
   * Process ID of the parent process.
   *
   * @type {number}
   * @memberof SerializedProcess
   */
  pa: number
  /**
   * Process priority
   *
   * @type {ProcessPriority}
   * @memberof SerializedProcess
   */
  pr: ProcessPriority
  /**
   * The className of the process.
   *
   * @type {string}
   * @memberof SerializedProcess
   */
  ex: string
}

type SerializedProcessTable = SerializedProcess[]

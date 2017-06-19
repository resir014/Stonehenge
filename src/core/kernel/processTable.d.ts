interface ProcessMemory {
}

interface SerializedProcess {
  /**
   * Process ID.
   *
   * @type {ProcessId}
   * @memberof SerializedProcess
   */
  id: ProcessId
  /**
   * Process ID of the parent process.
   *
   * @type {ProcessId}
   * @memberof SerializedProcess
   */
  pa: ProcessId
  /**
   * Process heat level.
   *
   * @type {number}
   * @memberof SerializedProcess
   */
  he: number
  /**
   * Returns `true` if the process is a service.
   *
   * @type {boolean}
   * @memberof SerializedProcess
   */
  se: boolean
  /**
   * The className of the process.
   *
   * @type {string}
   * @memberof SerializedProcess
   */
  ex: string
}

type SerializedProcessTable = SerializedProcess[]

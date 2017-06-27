/**
 * The base object for a process' memory. Extend this interface for any
 * custom process memories that we have.
 *
 * @interface ProcessMemory
 */
interface ProcessMemory {
}

/**
 * Details to the process stored in a serialised format.
 *
 * @interface SerializedProcess
 */
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
   * The className of the process.
   *
   * @type {string}
   * @memberof SerializedProcess
   */
  ex: string
}

/**
 * All list of running processes are stored in a serialised format on our
 * process table.
 */
type SerializedProcessTable = SerializedProcess[]

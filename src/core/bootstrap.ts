import { ProcessRegistry } from './kernel'

/*
 * Stonehenge kernel bootstrapper (codename: systemc)
 *
 * This file contains everything you need to boot up the Stonehenge kernel.
 * It will run on initial tick (i.e. when there's no memory in our process
 * table) and boots our designated root process.
 */

/**
 * *windows XP startup sound plays*
 *
 * @export
 * @param {IKernel} kernel The kernel object we're attempting to boot up.
 */
export const boot = (kernel: IKernel, rootProcess: ProcessConstructor) => {
  kernel.kLog(LogLevel.INFO, 'Welcome to Stonehenge!')
  kernel.kLog(LogLevel.INFO, 'Starting the init process for you...')
  ProcessRegistry.register(rootProcess)
  launchNew(kernel, rootProcess.className)
}

/**
 * Shorthand method to launch a new process.
 *
 * @param {IKernel} kernel The kernel object we're attempting to launch a process from.
 * @param {string} className The className of the process.
 * @returns {(ProcessId | undefined)} The `ProcessId` of the booted process
 */
const launchNew = (kernel: IKernel, className: string): ProcessId | undefined => {
  const p = kernel.spawnProcessByClassName(className, 0)
  if (p === undefined) {
    kernel.kLog(LogLevel.ERROR, 'Could not find specified process to spawn.')
    return
  }
  kernel.kLog(LogLevel.INFO, `Spawned process ${p.pid}`)
  kernel.saveProcessTable()
  return p.pid
}

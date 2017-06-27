import { ProcessRegistry } from './kernel'

/**
 * *windows XP startup sound plays*
 *
 * @export
 * @param {IKernel} kernel The kernel object we're attempting to boot up.
 */
export const boot = (kernel: IKernel, rootProcess: ProcessConstructor) => {
  kernel.kernelLog(LogLevel.INFO, 'Welcome to Stonehenge!')
  kernel.kernelLog(LogLevel.INFO, 'Starting the init process for you...')
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
    kernel.kernelLog(LogLevel.ERROR, 'Could not find specified process to spawn.')
    return
  }
  kernel.kernelLog(LogLevel.INFO, `Spawned process ${p.pid}:${p.className}`)
  kernel.saveProcessTable() // Because we're called after the kernel for some reason (TODO: Verify still true, it's been a while)
  return p.pid
}

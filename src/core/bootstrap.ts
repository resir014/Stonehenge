import { InitProcess } from '../processes/InitProcess'
import { ProcessRegistry } from './kernel'

const boot = (kernel: IKernel) => {
  kernel.kernelLog(LogLevel.INFO, 'Welcome to Stonehenge!')
  kernel.kernelLog(LogLevel.INFO, 'Starting the init process for you...')
  ProcessRegistry.register(InitProcess)
  launchNew(kernel, InitProcess.className)
}

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

export default boot

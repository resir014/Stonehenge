import { ProcessRegistry } from '../kernel'
import { InitProcess } from '../../processes/InitProcess'

const initCli = (g: NodeJS.Global, m: Memory, kernel: IKernel): void => {
  g.reset = function (): void {
    kernel.kernelLog(LogLevel.INFO, 'Rebooting...')
    kernel.mem.proc = null
    kernel.mem.pmem = {}
    kernel.reboot()
  }

  const inspect = (val: any) => JSON.stringify(val, undefined, 2)

  g.sinspect = inspect
  g.inspect = (val: any) => inspect(val)

  g.boot = () => {
    ProcessRegistry.register(InitProcess)
    g.launchNew(InitProcess.className)
  }

  g.launchNew = function (className: string): ProcessId | undefined {
    const p = kernel.spawnProcessByClassName(className, 0)
    if (p === undefined) {
      kernel.kernelLog(LogLevel.ERROR, 'Could not find specified process to spawn.')
      return
    }
    kernel.kernelLog(LogLevel.INFO, `Spawned process ${p.pid}:${p.className}`)
    kernel.saveProcessTable() // Because we're called after the kernel for some reason (TODO: Verify still true, it's been a while)
    return p.pid
  }

  if (!g.c) { Object.defineProperty(g, 'c', { get: () => Game.creeps }) }
  if (!g.s) { Object.defineProperty(g, 's', { get: () => Game.spawns }) }
  if (!g.f) { Object.defineProperty(g, 'f', { get: () => Game.flags }) }
}

export default initCli

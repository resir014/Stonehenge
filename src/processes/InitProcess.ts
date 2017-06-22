// import { CleanMemoryProc } from './cleanMemoryProc'
// import { RoomProc } from './roomProc'
import { log } from '../lib/logger'
import { Process, registerProc } from '../core/kernel/process'

@registerProc
export class InitProcess extends Process<ProcessMemory> {
  public readonly baseHeat: number = 1000

  public run (): void {
    // const kernel = this.kernel

    log.info('init process running')
    return
  }
}

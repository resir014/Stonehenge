// import { CleanMemoryProc } from './cleanMemoryProc'
// import { RoomProc } from './roomProc'
import { log } from '../lib/logger'
import { Process, registerProc } from '../core/kernel/process'

@registerProc
export class MemoryCleanerProcess extends Process<ProcessMemory> {
  public readonly baseHeat: number = 2

  public run (): void {
    this.cleanCreepMemory()
  }

  private cleanCreepMemory(): void {
    for (const name in Memory.creeps) {
      if (_.keys(Memory.creeps[name]).length === 0) {
        log.info('Clearing non-existing creep memory:', name)
        delete Memory.creeps[name]
      }
    }
  }
}

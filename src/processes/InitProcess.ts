import { MemoryCleanerProcess } from './MemoryCleanerProcess'
// import { RoomProc } from './roomProc'
// import { log } from '../lib/logger'
import { Process, registerProc } from '../core/kernel/process'

interface InitProcessMemory extends ProcessMemory {
  mc?: ProcessId
}

/**
 * The entry point to out Screeps codebase. The init process.
 *
 * @export
 * @class InitProcess
 * @extends {Process<InitProcessMemory>}
 */
@registerProc
export class InitProcess extends Process<InitProcessMemory> {
  public readonly baseHeat: number = 1000

  public run (): void {
    // const kernel = this.kernel

    this.initCleanerProcess()
    this.initialiseRooms()
  }

  private initCleanerProcess(): void {
    if (!this.memory.mc || !this.kernel.getProcessById(this.memory.mc)) {
      this.memory.mc = this.spawnChildProcess(MemoryCleanerProcess).pid
    }
  }

  private initialiseRooms(): void {
    _.each(Game.rooms, (room: Room) => {
      const controller: StructureController | undefined = room.controller
      if (!controller || !controller.my) return // we don't own this room, so why bother.

      if (!room.memory) {
        Memory.rooms[room.name] = {}
      }
    })
  }

  private createRoomProcess (room: Room, rmem: Readonly<RoomMemory>): IRoomProc {
    return this.spawnIndependentProcess(RoomProc).init(room);
  }
}

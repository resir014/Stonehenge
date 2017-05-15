import Orchestrator from '../core/orchestrator'
import { Profile } from '../lib/profiler/profile'
import { log } from '../lib/logger/log'

import { SourceManager } from '../shared/sourceManager'
import { CreepManager } from './creep/creepManager'

/**
 * In a Stonehenge perspective, the centre of a Screeps colony lies in the room.
 * The RoomManager contains global initialisations regarding memory, as well as
 * job initialisations.
 *
 * @export
 * @class RoomManager
 */
export class RoomManager {
  protected room: Room
  protected memory: { [key: string]: any }
  protected sourceManager: SourceManager

  /**
   * Creates an instance of RoomManager.
   * @param {Room} room The current room.
   *
   * @memberOf RoomManager
   */
  constructor(room: Room) {
    this.room = room
    this.memory = room.memory

    this.sourceManager = new SourceManager(room)
  }

  /**
   * Run the module.
   */
  @Profile()
  public run(): void {
    this.initializeMemory()
    this.refreshMiningPositions()
    this.cleanupCreepMemory()

    Orchestrator.refreshJobAssignments(this.room)
    this.sourceManager.refreshAvailableSources()

    const creepManager = new CreepManager(this.room)
    creepManager.run()
  }

  /**
   * Checks memory for null or out of bounds objects
   */
  @Profile()
  private initializeMemory(): void {
    if (!this.memory.jobs) {
      this.memory.jobs = {}
    }

    if (!this.memory.manualJobControl) {
      this.memory.manualJobControl = true
    }
  }

  /**
   * Refreshes every memory entry of mining positions available on the room.
   */
  @Profile()
  private refreshMiningPositions(): void {
    if (!this.memory.sources) {
      this.memory.sources = []
    }
  }

  /**
   * Remove dead creeps in memory.
   */
  @Profile()
  private cleanupCreepMemory(): void {
    for (const name in Memory.creeps) {
      const creep: any = Memory.creeps[name]

      if (creep.room === this.room.name) {
        if (!Game.creeps[name]) {
          log.info('Clearing non-existing creep memory:', name)

          if (Memory.creeps[name].role === 'sourceMiner') {
            // Push the now-dead creep's assigned source back to the sources array.
            this.memory.sources.push(Memory.creeps[name].assignedSource)
          }

          delete Memory.creeps[name]
        }
      } else if (_.keys(Memory.creeps[name]).length === 0) {
        log.info('Clearing non-existing creep memory:', name)
        delete Memory.creeps[name]
      }
    }
  }
}

import { log } from '../lib/logger/log'
import { controlledRoomJobs } from '../config/jobs'
import { IRoomOrchestrator } from './types'

export class RoomOrchestrator implements IRoomOrchestrator {
  // The basic state for object
  public room: Room
  public memory: { [key: string]: any }

  // Static, exploitable room objects
  public minerals: Mineral[]
  public energySources: Source[]
  public resources: Resource[]

  constructor (room: Room) {
    this.room = room
    this.memory = room.memory

    this.initialiseMemory()
    this.refreshMiningPositions()
    this.refreshRoomObjects()
    this.cleanupCreepMemory()
  }

  /**
   * Refreshes the job assignment available in a room.
   *
   * @todo If `manualJobControl` is set to `false` in the room memory, it's
   * going to invoke a method which will ~automagically~ define job assignments
   * based on some parameters. We don't even have that function yet.
   *
   * @param {Room} room The target room.
   * @memberof RoomOrchestrator
   */
  public refreshJobAssignments(): void {
    // Check if all job assignments are initialised properly.
    if (_.keys(this.room.memory.jobs).length !== _.keys(controlledRoomJobs).length) {
      const jobsToAdd = _.difference(controlledRoomJobs, _.keys(this.room.memory.jobs))
      for (const i in jobsToAdd) {
        this.room.memory.jobs[jobsToAdd[i]] = 0
      }
    }
  }

  /**
   * Checks memory for null or out of bounds objects
   */
  private initialiseMemory(): void {
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
  private refreshMiningPositions(): void {
    if (!this.memory.sources) {
      this.memory.sources = []
    }
  }

  /**
   * Refreshes static room objects.
   *
   * @private
   * @memberof RoomOrchestrator
   */
  private refreshRoomObjects(): void {
    this.minerals = this.room.find<Mineral>(FIND_MINERALS)
    this.energySources = this.room.find<Source>(FIND_SOURCES)
    this.resources = this.room.find<Resource>(FIND_DROPPED_RESOURCES)
  }

  /**
   * Remove dead creeps in memory.
   */
  private cleanupCreepMemory(): void {
    for (const name in Memory.creeps) {
      const creep: any = Memory.creeps[name]

      if (creep.room === this.room.name) {
        if (!Game.creeps[name]) {
          log.info(`[RoomOrchestrator] Clearing non-existing creep memory: ${name}`)

          if (Memory.creeps[name].role === 'sourceMiner') {
            // Push the now-dead creep's assigned source back to the sources array.
            this.memory.sources.push(Memory.creeps[name].assignedSource)
          }

          delete Memory.creeps[name]
        }
      } else if (_.keys(Memory.creeps[name]).length === 0) {
        log.info(`[RoomOrchestrator] Clearing non-existing creep memory: ${name}`)
        delete Memory.creeps[name]
      }
    }
  }
}

import * as Config from '../config/config'
import { log } from '../lib/logger/log'

/**
 * The SourceManager manages energy sources available in a room.
 *
 * @export
 * @class SourceManager
 */
export class SourceManager {
  public memory: Memory
  public sources: Source[]
  public sourceCount: number
  public lookResults: LookAtResultMatrix | LookAtResultWithPos[]

  /**
   * Creates an instance of SourceManager.
   * @param {Room} room The current room.
   *
   * @memberOf SourceManager
   */
  constructor(room: Room) {
    this.memory = room.memory
    this.sources = room.find<Source>(FIND_SOURCES)
    this.sourceCount = _.size(this.sources)

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug(`[SourceManager] ${this.sourceCount} source mining jobs available in room.`)
    }
  }

  /**
   * Create an array of all sources in the room and update job entries where
   * available. This should ensure that each room has 1 harvester per source.
   */
  public refreshAvailableSources(): void {
    if (this.memory.sources.length === 0) {
      this.sources.forEach((source: Source) => {
        // Create an array of all sources in the room
        this.memory.sources.push(source)
      })
    }

    // Update job assignments.
    this.memory.jobs.harvester = this.sources.length
  }
}

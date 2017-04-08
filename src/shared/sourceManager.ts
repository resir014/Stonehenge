import * as Config from "../config/config";
import { log } from "../lib/logger/log";

export default class SourceManager {
  public memory: Memory;
  public sources: Source[];
  public sourceCount: number;
  public lookResults: LookAtResultMatrix | LookAtResultWithPos[];

  constructor(room: Room) {
    this.memory = room.memory;
    this.sources = room.find<Source>(FIND_SOURCES_ACTIVE);
    this.sourceCount = _.size(this.sources);

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug("[SourceManager] " + this.sourceCount + " source mining jobs available in room.");
    }
  }

  public refreshAvailableSources() {
    let self = this;

    if (self.memory.unoccupiedMiningPositions.length === 0) {
      this.sources.forEach((source: Source) => {
        // get an array of all adjacent terrain features near the spawn
        this.lookResults = source.room.lookForAtArea(
          LOOK_TERRAIN,
          source.pos.y - 1,
          source.pos.x - 1,
          source.pos.y + 1,
          source.pos.x + 1,
          true
        );

        for (let result of <LookAtResultWithPos[]> this.lookResults) {
          if (result.terrain === "plain" || result.terrain === "swamp") {
            self.memory.unoccupiedMiningPositions
              .push(new RoomPosition(result.x, result.y, source.room.name));
          }
        }
      });

      self.memory.jobs.sourceMiningJobs = self.memory.unoccupiedMiningPositions.length;
    } else {
      self.memory.jobs.sourceMiningJobs = self.memory.unoccupiedMiningPositions.length;
    }
  }
}

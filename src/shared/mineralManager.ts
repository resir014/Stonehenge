import * as Config from "../config/config";
import { log } from "../lib/logger/log";

export default class MineralManager {
  public minerals: Mineral[];
  public mineralCount: number;

  constructor(room: Room) {
    this.minerals = room.find<Mineral>(FIND_MINERALS);
    this.mineralCount = _.size(this.minerals);

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug("[MineralManager] " + this.mineralCount + " minerals found.");
    }
  }
}

import * as Config from "../../config/config";
import { log } from "../../lib/logger/log";

export default class SharedStructureManager {
  public structures: Structure[];
  public structureCount: number;

  constructor(room: Room) {
    this.structures = room.find<Structure>(FIND_STRUCTURES);
    this.structureCount = _.size(this.structures);

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug("[StructureManager]" + this.structureCount + " structures found.");
    }
  }
}

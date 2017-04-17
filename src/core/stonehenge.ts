import * as Config from "../config/config";

import { log } from "../lib/logger/log";
import { Profile } from "../lib/profiler/profile";
import { RoomManager } from "../room/roomManager";

/**
 * Stonehenge is a colony management system for the game Screeps designed with
 * modularity in mind.
 */
export class Stonehenge {
  @Profile
  public run() {
    // Check memory for null or out of bounds custom objects.
    this.checkOutOfBoundsMemory();

    // For each controlled room, run colony actions.
    for (let i in Game.rooms) {
      let room: Room = Game.rooms[i];

      let colony = new RoomManager(room);
      colony.run();
    }

    if (Config.ENABLE_DEBUG_MODE) {
      log.info("Stonehenge.run()");
    }
  }

  /**
   * Check memory for null or out of bounds custom objects
   *
   * @export
   */
  private checkOutOfBoundsMemory() {
    if (!Memory.guid || Memory.guid > 100) {
      Memory.guid = 0;
    }

    if (!Memory.creeps) {
      Memory.creeps = {};
    }
    if (!Memory.flags) {
      Memory.flags = {};
    }
    if (!Memory.rooms) {
      Memory.rooms = {};
    }
    if (!Memory.spawns) {
      Memory.spawns = {};
    }
  }
}

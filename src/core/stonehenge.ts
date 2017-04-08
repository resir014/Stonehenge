import { log } from "../lib/logger";
import { profile } from "../lib/profiler";
import ColonyManager from "../colony/colonyManager";

/**
 * Stonehenge is a colony management system for the game Screeps designed with
 * modularity in mind.
 */
export default class Stonehenge {
  @profile
  public run() {
    // Check memory for null or out of bounds custom objects.
    this.checkOutOfBoundsMemory();

    // For each controlled room, run colony actions.
    for (let i in Game.rooms) {
      let room: Room = Game.rooms[i];

      let colony = new ColonyManager(room);
      colony.run();
    }

    log.info("Stonehenge.run()");
  }

  /**
   * Creates a unique guid for a creep/queued task.
   *
   * @export
   * @returns The guid used for a task
   */
  protected getGuid() {
    if (!Memory.guid || Memory.guid > 100) {
      Memory.guid = 0;
    }

    Memory.guid = Memory.guid + 1;
    return Memory.guid;
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
    if (!Memory.modules) {
      Memory.modules = {};
    }
  }
}

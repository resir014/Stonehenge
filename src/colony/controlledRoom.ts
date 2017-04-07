import { profile } from "../lib/profiler";
import { log } from "../lib/logger";
import { controlledRoomJobs } from "../config/jobs";
import ControlledRoomCreepManager from "./creep/manager/controlledRoomCreepManager";

export default class ControlledRoomColony {
  protected room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  @profile
  public run(): void {
    this.initializeMemory();
    this.refreshMiningPositions();
    this.cleanupCreepMemory();

    // TODO: probably break these down further into modules?
    let creepManager = new ControlledRoomCreepManager(this.room);
    creepManager.run();
  }

  /**
   * Checks memory for null or out of bounds objects
   */
  @profile
  private initializeMemory() {
    if (!Memory.rooms[this.room.name]) {
      Memory.rooms[this.room.name] = {};
    }

    if (!Memory.rooms[this.room.name].jobs) {
      Memory.rooms[this.room.name].jobs = controlledRoomJobs;
    }

    if (!Memory.rooms[this.room.name].claimedFlags) {
      Memory.rooms[this.room.name].claimedFlags = [];
    }
  }

  /**
   * Refreshes every memory entry of mining positions available on the room.
   */
  @profile
  private refreshMiningPositions() {
    if (!Memory.rooms[this.room.name]) {
      Memory.rooms[this.room.name] = {};
    }
    if (!Memory.rooms[this.room.name].unoccupied_mining_positions) {
      Memory.rooms[this.room.name].unoccupied_mining_positions = [];
    }
  }

  /**
   * Remove dead creeps in memory.
   */
  @profile
  private cleanupCreepMemory() {
    for (let name in Memory.creeps) {
      let creep: any = Memory.creeps[name];

      if (creep.room === this.room.name) {
        if (!Game.creeps[name]) {
          log.info("[MemoryManager] Clearing non-existing creep memory:", name);

          if (Memory.creeps[name].role === "sourceMiner") {
            Memory.rooms[this.room.name].unoccupiedMiningPositions
              .push(Memory.creeps[name].occupiedMiningPosition);
          }

          delete Memory.creeps[name];
        }
      } else if (_.keys(Memory.creeps[name]).length === 0) {
        log.info("[MemoryManager] Clearing non-existing creep memory:", name);
        delete Memory.creeps[name];
      }
    }
  }
}

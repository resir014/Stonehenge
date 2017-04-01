import { profile } from "../lib/profiler";
import { log } from "../lib/logger";
import { controlledRoomJobs } from "../config/jobs";
import Colony from "../core/colony";
import CreepBuilder from "../modules/creepBuilder";
import ControlledRoomCreepManager from "./creep/controlledRoomCreepManager";

export default class ControlledRoomColony extends Colony {
  constructor(room: Room) {
    super(room);
  }

  @profile
  public run(): void {
    this.initializeMemory();
    this.cleanupCreepMemory();

    // TODO: probably break these down further into modules?
    let creepManager = new ControlledRoomCreepManager(this.room);
    creepManager.run();
  }

  /**
   * Checks memory for null or out of bounds objects
   */
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
   * Remove dead creeps in memory.
   */
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

  @profile
  private buildCreep(spawn: Spawn, role: string, bodyParts: string[]) {
    let payload: IModulePayload = {
      spawn: spawn,
      role: role,
      room: spawn.room.name,
      bodyParts: bodyParts
    };

    new CreepBuilder().run(payload);
  }
}

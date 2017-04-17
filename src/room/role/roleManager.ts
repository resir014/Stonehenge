import { Profile } from "../../lib/profiler/profile";
import { RoomManager } from "../roomManager";

import { Harvester } from "./type/harvester";

/**
 * This class is basically a "creep manager" - it's nearly the same in
 * functionality as my old `CreepManager` class, but with a more well-structured
 * class tree.
 */
export class RoleManager extends RoomManager {
  protected creeps: Creep[];
  protected creepCount: number;

  private harvesters: Creep[];
  private haulers: Creep[];
  private builders: Creep[];
  private upgraders: Creep[];
  private wallMaintainers: Creep[];
  private rampartMaintainers: Creep[];
  private roadMaintainers: Creep[];
  private defenders: Creep[];
  private mineralMiners: Creep[];

  /**
   * Creates an instance of RoleManager
   *
   * @param room The current room.
   */
  constructor(room: Room) {
    super(room);
    this.creeps = this.room.find<Creep>(FIND_MY_CREEPS);
    this.creepCount = _.size(this.creeps);
    this.loadCreeps();
  }

  /**
   * Run the module.
   */
  @Profile
  public run() {
    this.buildMissingCreeps();

    this.harvesters.forEach((creep: Creep) => {
      let harvester = new Harvester(creep);
      harvester.run();
    });
  }

  /**
   * Filters out each Creep by its associated role.
   */
  private loadCreeps() {
    this.harvesters = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "harvester";
    });
    this.haulers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "hauler";
    });
    this.builders = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "builder";
    });
    this.upgraders = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "upgrader";
    });
    this.wallMaintainers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "wallMaintainer";
    });
    this.rampartMaintainers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "rampartMaintainer";
    });
    this.roadMaintainers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "roadMaintainer";
    });
    this.defenders = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "defender";
    });
    this.mineralMiners = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === "mineralMiner";
    });
  }

  /**
   * Builds any missing creeps for that colony.
   */
  @Profile
  private buildMissingCreeps() {
    //
  }
}

import { profile } from "../../lib/profiler";
import ColonyManager from "../colonyManager";

import Harvester from "./type/harvester";

export default class ControlledRoomCreepManager extends ColonyManager {
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

  constructor(room: Room) {
    super(room);
    this.creeps = this.room.find<Creep>(FIND_MY_CREEPS);
    this.creepCount = _.size(this.creeps);
    this.loadCreeps();
  }

  /**
   * Run the module.
   */
  @profile
  public run() {
    this.buildMissingCreeps();

    this.harvesters.forEach((creep: Creep) => {
      let sourceMiner = new Harvester(creep);
      sourceMiner.run();
    });
  }

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

  @profile
  private buildMissingCreeps() {
    //
  }
}

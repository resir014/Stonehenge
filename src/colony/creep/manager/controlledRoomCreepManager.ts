import { profile } from "../../../lib/profiler";
import BaseManager from "../baseManager";
import SourceMiner from "../role/sourceMiner";

export default class ControlledRoomCreepManager extends BaseManager {
  private sourceMiners: Creep[];
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

  @profile
  public run() {
    this.sourceMiners.forEach(function (creep: Creep) {
      let sourceMiner = new SourceMiner(creep);
      sourceMiner.run();
    });
  }

  private loadCreeps() {
    this.sourceMiners = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "sourceMiner";
    });
    this.haulers = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "hauler";
    });
    this.builders = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "builder";
    });
    this.upgraders = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "upgrader";
    });
    this.wallMaintainers = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "wallMaintainer";
    });
    this.rampartMaintainers = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "rampartMaintainer";
    });
    this.roadMaintainers = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "roadMaintainer";
    });
    this.defenders = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "defender";
    });
    this.mineralMiners = this.creeps.filter(function (creep: Creep) {
      return creep.memory.role === "mineralMiner";
    });
  }
}

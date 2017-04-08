import { profile } from "../../../lib/profiler";
import BaseRole from "../baseRole";

export default class SourceMiner extends BaseRole {
  constructor(creep: Creep) {
    super(creep);
  }

  @profile
  public run() {
    let availablePositions: RoomPosition[] = Memory.rooms[this.creep.room.name]
      .unoccupiedMiningPositions;
    let assignedPosition: RoomPosition;

    if (availablePositions.length > 0 && !this.creep.memory.occupiedMiningPosition) {
      this.creep.memory.occupiedMiningPosition = availablePositions.pop();
      assignedPosition = new RoomPosition(
        this.creep.memory.occupiedMiningPosition.x,
        this.creep.memory.occupiedMiningPosition.y,
        this.creep.memory.occupiedMiningPosition.roomName
      );
      Memory.rooms[this.creep.room.name].unoccupiedMiningPositions = availablePositions;
    } else {
      assignedPosition = new RoomPosition(
        this.creep.memory.occupiedMiningPosition.x,
        this.creep.memory.occupiedMiningPosition.y,
        this.creep.memory.occupiedMiningPosition.roomName
      );
    }

    if (this.creep.pos.isEqualTo(assignedPosition)) {
      let targetSource = this.creep.pos.findClosestByPath<Source>(FIND_SOURCES);
      this.tryHarvest(targetSource);
    } else {
      this.moveTo(assignedPosition, 1);
    }
  }

  /**
   * Attempt to harvest energy.
   *
   * @param {Creep} creep
   * @param {Source} target
   * @returns {number}
   */
  private tryHarvest(target: Source): number {
    return this.creep.harvest(target);
  }
}

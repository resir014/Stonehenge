import { profile } from "../../../lib/profiler";
import BaseRole from "../../../core/creep/baseRole";

export default class SourceMiner extends BaseRole {
  constructor(creep: Creep) {
    super(creep);
  }

  @profile
  public run() {
    let availablePositions: RoomPosition[] = Memory.rooms[this.creep.room.name]
      .unoccupied_mining_positions;
    let assignedPosition: RoomPosition;

    if (availablePositions.length > 0 && !this.creep.memory.occupied_mining_position) {
      this.creep.memory.occupied_mining_position = availablePositions.pop();
      assignedPosition = new RoomPosition(
        this.creep.memory.occupied_mining_position.x,
        this.creep.memory.occupied_mining_position.y,
        this.creep.memory.occupied_mining_position.roomName
      );
      Memory.rooms[this.creep.room.name].unoccupied_mining_positions = availablePositions;
    } else {
      assignedPosition = new RoomPosition(
        this.creep.memory.occupied_mining_position.x,
        this.creep.memory.occupied_mining_position.y,
        this.creep.memory.occupied_mining_position.roomName
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

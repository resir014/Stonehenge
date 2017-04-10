import { profile } from "../../../lib/profiler";
import Role from "../role";

export default class Harvester extends Role {
  constructor(creep: Creep) {
    super(creep);
  }

  /**
   * Run the module.
   */
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
      this.moveToPosition(assignedPosition, 1);
    }
  }

  /**
   * Attempt to harvest energy.
   *
   * @param target
   */
  @profile
  private tryHarvest(target: Source): number {
    return this.creep.harvest(target);
  }
}

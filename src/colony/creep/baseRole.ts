import BaseCreep from "./baseCreep";

/**
 * Shared roles for all Creeps.
 *
 * @export
 * @default
 * @class BaseRole
 */
export default class BaseRole extends BaseCreep {
  public state: string;

  /**
   * Creates an instance of BaseRole.
   *
   * @param {Creep} creep The creep.
   */
  constructor(creep: Creep) {
    super(creep);
  }

  /**
   * Extended method of `Creep.moveTo()`.
   *
   * @param {(RoomPosition | { pos: RoomPosition })} target
   * @param {number} maxRooms
   * @returns {number}
   */
  public moveTo(target: Structure | RoomPosition, maxRooms: number): number {
    let self = this;
    let result: number = 0;

    // Execute moves by cached paths at first
    result = self.creep.moveTo(target, { noPathFinding: true });

    // Perform pathfinding only if we have enough CPU
    if (result !== 0) {
      if (Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
        result = self.creep.moveTo(target, { maxRooms: maxRooms });
      }
    }
    return result;
  }

  /**
   * Shorthand method for `renewCreep()`.
   *
   * @param {Spawn} spawn
   * @returns {number}
   */
  public tryRenew(spawn: Spawn): number {
    return spawn.renewCreep(this.creep);
  }

  /**
   * Moves a creep to a designated renew spot (in this case the spawn).
   *
   * @param {Spawn} spawn
   */
  public moveToRenew(spawn: Spawn): void {
    if (this.tryRenew(spawn) === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(spawn);
    }
  }
}

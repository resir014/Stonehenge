/**
 * Shared role for all Creeps.
 */
export class Role {
  protected memory: Memory;
  protected creep: Creep;
  protected state: string;

  /**
   * Creates an instance of Role.
   *
   * @param creep The creep.
   */
  constructor(creep: Creep) {
    this.creep = creep;
    this.memory = creep.memory;
    this.state = this.memory.state;
  }

  /**
   * Extended method of `Creep.moveTo()`.
   *
   * @param target The target room object.
   * @param maxRooms The maximum allowed rooms to search. The default (and
   *   maximum) is 16. This is only used when the new `PathFinder` is enabled.
   */
  public moveTo<T extends RoomObject>(target: T, maxRooms?: number): number {
    let self = this;
    let result: number = 0;

    // Execute moves by cached paths at first
    result = self.creep.moveTo(target, { noPathFinding: true });

    // Perform pathfinding only if we have enough CPU
    if (result !== 0) {
      if (Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
        result = self.creep.moveTo(target, { maxRooms: maxRooms || 1 });
      }
    }
    return result;
  }

  /**
   * Extended method of `Creep.moveTo()`, adjusted for RoomPosition.
   *
   * @param target The target room position.
   * @param maxRooms The maximum allowed rooms to search. The default (and
   *   maximum) is 16. This is only used when the new `PathFinder` is enabled.
   */
  public moveToPosition(target: RoomPosition, maxRooms?: number): number {
    let self = this;
    let result: number = 0;

    // Execute moves by cached paths at first
    result = self.creep.moveTo(target, { noPathFinding: true });

    // Perform pathfinding only if we have enough CPU
    if (result !== 0) {
      if (Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
        result = self.creep.moveTo(target, { maxRooms: maxRooms || 1 });
      }
    }
    return result;
  }

  /**
   * Shorthand method for `renewCreep()`.
   *
   * @param spawn The current room's spawn.
   */
  public tryRenew(spawn: Spawn): number {
    return spawn.renewCreep(this.creep);
  }

  /**
   * Moves a creep to a designated renew spot (in this case the spawn).
   *
   * @param spawn The current room's spawn.
   */
  public moveToRenew(spawn: Spawn): void {
    if (this.tryRenew(spawn) === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(spawn);
    }
  }

  /**
   * Attempts retrieving and dropped resources and/or resources in a container.
   */
  public tryRetrieveEnergy(): void {
    let targetSource = this.creep.pos.findClosestByPath<Resource>(FIND_DROPPED_RESOURCES);

    if (targetSource) {
      if (this.creep.pos.isNearTo(targetSource)) {
        this.creep.pickup(targetSource);
      } else {
        this.moveTo(targetSource);
      }
    } else {
      let targetContainer = this.creep.pos.findClosestByPath<Container>(FIND_STRUCTURES, {
        filter: ((structure: Structure) => {
          if (structure.structureType === STRUCTURE_CONTAINER) {
            let container = structure as Container;
            if (_.sum(container.store) > (500)) {
              return container;
            }
          }
        })
      });

      if (targetContainer) {
        if (this.creep.pos.isNearTo(targetContainer)) {
          this.creep.withdraw(targetContainer, RESOURCE_ENERGY);
        } else {
          this.moveTo(targetContainer);
        }
      }
    }
  }
}

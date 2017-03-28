import * as MemoryManager from "../core/shared/memoryManager";

import { Colony } from "../core/colony";
import CreepBuilder from "../modules/creepBuilder";

export default class ControlledRoomColony extends Colony {
  constructor(room: Room) {
    super(room);
  }

  public run(): void {
    let spawn: Spawn = this.room.find<Spawn>(FIND_MY_SPAWNS)[0];
    let creeps: Creep[] = this.room.find<Creep>(FIND_MY_CREEPS);

    if (creeps.length < 1) {
      this.buildCreep(spawn, "sourceMiner", [WORK, WORK, MOVE, CARRY]);
    }
  }

  private buildCreep(spawn: Spawn, role: string, bodyParts: string[]) {
    let payload: IModulePayload = {
      spawn: spawn,
      role: role,
      room: spawn.room.name,
      bodyParts: bodyParts
    };

    new CreepBuilder(MemoryManager.getGuid(), payload).runModule();
  }
}

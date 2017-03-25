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

    let payload: IModulePayload = {
      spawn: spawn,
      role: "sourceMiner",
      room: spawn.room.name,
      bodyParts: [WORK, WORK, MOVE, CARRY]
    };

    if (creeps.length < 1) {
      new CreepBuilder(MemoryManager.getGuid(), payload).runModule();
    }
  }
}

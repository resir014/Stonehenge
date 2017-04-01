import * as Config from "../config/config";
import Module from "../core/module";
import * as MemoryManager from "../core/shared/memoryManager";
import { log } from "../lib/logger/log";

export default class CreepBuilder extends Module {
  constructor(config?: IModuleConfig) {
    super("bodyPartsBuilder", config);
  }

  public run(payload: IModulePayload): IModuleResponse {
    if (!this.checkPayload(payload)) {
      if (Config.ENABLE_DEBUG_MODE) {
        log.error("[CreepBuilder] Invalid properties are supplied for this module.");
      }
      return {
        status: ModuleStatus.ERROR
      };
    }

    let guid: number = MemoryManager.getGuid();
    let spawn: Spawn = payload.spawn;
    let name: string | undefined = `${payload.room} - ${payload.role}#${guid}`;
    let body: string[] = payload.bodyParts;
    let status: number | string = spawn.canCreateCreep(body);

    status = _.isString(status) ? OK : status;

    if (status === OK) {
      let properties: { [key: string]: any } = {
        guid: guid,
        role: payload.role,
        room: payload.room
      };

      status = spawn.createCreep(body, name, properties);

      let response: IModuleResponse = {
        status: _.isString(status) ? OK : status,
        data: properties
      };
      return response;
    } else {
      if (Config.ENABLE_DEBUG_MODE) {
        log.error("[CreepBuilder] Failed creating new creep: " + status);
      }

      let response: IModuleResponse = {
        status: status
      };
      return response;
    }
  }

  private checkPayload(payload: IModulePayload): boolean {
    let requiredProps = ["spawn", "room", "role", "bodyParts"];
    let payloadKeys = _.intersection(_.keys(payload), requiredProps);

    if (payloadKeys.length === requiredProps.length) {
      return true;
    }

    return false;
  }
}

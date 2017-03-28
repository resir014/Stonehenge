import { Module } from "../core/module";

export default class CreepBuilder extends Module {
  constructor(guid: number, payload: IModulePayload) {
    super(guid, payload);
  }

  public runModule(): IModuleResponse {
    let spawn: Spawn = this.payload.spawn;
    let name: string | undefined = undefined;
    let body: string[] = this.payload.bodyParts;
    let status: number | string = spawn.canCreateCreep(body);

    status = _.isString(status) ? OK : status;

    if (status === OK) {
      let properties: { [key: string]: any } = {
        guid: this.guid,
        role: this.payload.role ? this.payload.role : "",
        room: this.payload.room ? this.payload.room : ""
      };

      status = spawn.createCreep(body, name, properties);

      let response: IModuleResponse = {
        status: _.isString(status) ? OK : status,
        data: properties
      };
      return response;
    } else {
      // if (Config.ENABLE_DEBUG_MODE) {
      //   log.error("Failed creating new creep: " + status);
      // }

      let response: IModuleResponse = {
        status: status
      };
      return response;
    }
  }
}

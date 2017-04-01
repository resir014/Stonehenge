import Module from "../core/module";

export default class CreepBodyPartsBuilder extends Module {
  constructor(config?: IModuleConfig) {
    super("bodyPartsBuilder", config);
  }

  public run(): IModuleResponse {
    return {
      status: 0
    };
  }
}

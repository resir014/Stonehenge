import * as MemoryManager from "./shared/memoryManager";

abstract class Module {
  public guid: number;
  public payload: IModulePayload;

  constructor(guid: number, payload: IModulePayload) {
    this.guid = guid || MemoryManager.getGuid();
    this.payload = payload;
  }

  public abstract runModule(...args: any[]): IModuleResponse;
}

export default Module;

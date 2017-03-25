import * as MemoryManager from "./shared/memoryManager";

export abstract class Module {
  public globalId: number;
  public payload: IModulePayload;

  constructor(globalId: number, payload: IModulePayload) {
    this.globalId = globalId || MemoryManager.getGlobalId();
    this.payload = payload;
  }

  public abstract runModule(...args: any[]): IModuleResponse;
}

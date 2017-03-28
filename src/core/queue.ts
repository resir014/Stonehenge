import * as MemoryManager from "./shared/memoryManager";

export default class QueuedAction {
  public id: number;
  public action: any;
  public stopResult: any;
  public tickLimit: number;
  public startTime: number;

  constructor(id: number, action: any, stopResult: any, tickLimit?: number, startTime?: number) {
    this.id = id || MemoryManager.getGuid();
    this.action = action;
    this.stopResult = stopResult;
    this.tickLimit = tickLimit || 100;
    this.startTime = startTime || Game.time;
  }

  public add(id: number) {
    Memory.queuedActions[id] = this;
  }

  public run() {
    let func = Function(this.action);
    try {
      let result = func();
      if (result === this.stopResult) {
        return false;
      }
      if (Game.time - this.startTime >= this.tickLimit) {
        return false;
      }
    } catch (error) {
      console.log(error.stack);
      return false;
    }
    return true;
  }

  public clear() {
    //
  }
}

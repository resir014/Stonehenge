export default class CreepState {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  // public getTargetId<T>(target: T): string {
  //   if (target.hasOwnProperty("id")) {
  //     return target.id;
  //   }
  // }

  public getTargetById<T>(id: string): T | null {
    return Game.getObjectById<T>(id);
  }
}

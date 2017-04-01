import SourceManager from "../source/controlledRoomSourceManager";

export default class CreepManager {
  public creeps: Creep[];
  public creepCount: number;
  public room: Room;
  public sourceManager: SourceManager;

  constructor(room: Room) {
    this.room = room;
    this.sourceManager = new SourceManager(room);
  }
}

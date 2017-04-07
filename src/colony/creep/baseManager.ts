import SourceManager from "../source/controlledRoomSourceManager";

export default class BaseManager {
  protected room: Room;
  protected spawns: Spawn[];
  protected sourceManager: SourceManager;

  constructor(room: Room) {
    this.room = room;
    this.spawns = room.find<Spawn>(FIND_MY_SPAWNS);
    this.sourceManager = new SourceManager(room);
  }
}

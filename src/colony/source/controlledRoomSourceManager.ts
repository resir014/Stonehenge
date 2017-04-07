import SharedSourceManager from "../../shared/sourceManager";

export default class ControlledRoomSourceManager extends SharedSourceManager {
  constructor(room: Room) {
    super(room);
    this.refreshAvailableSources();
  }
}

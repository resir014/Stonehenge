import SharedSourceManager from "../../core/shared/sourceManager";

export default class ControlledRoomSourceManager extends SharedSourceManager {
  constructor(room: Room) {
    super(room);
    this.refreshAvailableSources();
  }
}

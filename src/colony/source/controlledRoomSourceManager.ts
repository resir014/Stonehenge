import SharedSourceManager from "../../shared/sourceManager";

export default class ControlledRoomSourceManager extends SharedSourceManager {
  /**
   * Creates an instance of ControlledRoomSourceManager.
   *
   * @param room The current room.
   */
  constructor(room: Room) {
    super(room);
    this.refreshAvailableSources();
  }
}

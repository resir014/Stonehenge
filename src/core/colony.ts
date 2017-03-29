abstract class Colony {
  protected room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  public abstract run(): void;
}

export default Colony;

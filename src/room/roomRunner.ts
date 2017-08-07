import { IRoomOrchestrator, IRoomRunner } from './types'
import { RoomOrchestrator } from './roomOrchestrator'

export class RoomRunner implements IRoomRunner {
  protected room: Room
  protected orchestrator: IRoomOrchestrator

  constructor (room: Room) {
    this.room = room
    this.orchestrator = new RoomOrchestrator(room)
  }

  public run(): void {
    //
  }
}

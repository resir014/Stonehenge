import { controlledRoomJobs } from "../config/jobs";
import { SourceManager } from "../shared/sourceManager";

/**
 * Orchestrator is the brain of each Colony. It provides a facility to perform
 * global managerial tasks within a Colony, including managing job assignment,
 * job priorities, mining/construction positions, etc.
 */
export class Orchestrator {
  public room: Room;
  public sourceManager: SourceManager;

  private memory: { [key: string]: any };

  /**
   * Creates an instance of Orchestrator.
   *
   * @param room The current room.
   */
  constructor(room: Room) {
    this.room = room;
    this.memory = room.memory;
    this.sourceManager = new SourceManager(room);
  }

  /**
   * Refreshes the job assignment available in a room.
   *
   * @todo If `manualJobControl` is set to `false in the room memory, it's going
   * to invoke a method which will ~automagically~ define job assignments based
   * on some parameters. We don't even have that function yet.
   */
  public refreshJobAssignments() {
    // Check if all job assignments are initialised properly.
    let availableJobs = _.intersection(_.keys(this.memory.jobs), controlledRoomJobs);
    if (!availableJobs) {
      for (let i in controlledRoomJobs) {
        this.memory.jobs[controlledRoomJobs[i]] = 0;
      }
    }
    if (availableJobs.length !== controlledRoomJobs.length) {
      let jobsToAdd = _.difference(_.keys(this.memory.jobs), controlledRoomJobs);
      for (let i in jobsToAdd) {
        this.memory.jobs[jobsToAdd[i]] = 0;
      }
    }
  }
}

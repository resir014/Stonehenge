import { controlledRoomJobs } from "../config/jobs";

/**
 * Orchestrator is the brain of each Colony. It provides several useful APIs to
 * perform global managerial tasks within a Colony, including managing memory,
 * job assignment, job priorities, mining/construction positions, etc.
 *
 * The Orchestrator is a singleton class, meaning that its instantiation is
 * restricted to one object:
 *
 * ```ts
 * const orchestrator = Orchestrator.getInstance();
 * ```
 */
export class Orchestrator {
  private static instance: Orchestrator = new Orchestrator();

  constructor() {
    if (Orchestrator.instance) {
      throw new Error("The Orchestrator is a singleton class and cannot be created!");
    }

    Orchestrator.instance = this;
  }

  /**
   * Creates a singleton instance of Orchestrator.
   */
  public static getInstance(): Orchestrator {
    return Orchestrator.instance;
  }

  /**
   * Refreshes the job assignment available in a room.
   *
   * @todo If `manualJobControl` is set to `false in the room memory, it's going
   * to invoke a method which will ~automagically~ define job assignments based
   * on some parameters. We don't even have that function yet.
   *
   * @param room The target room.
   */
  public refreshJobAssignments(room: Room) {
    // Check if all job assignments are initialised properly.
    let availableJobs = _.intersection(_.keys(room.memory.jobs), controlledRoomJobs);
    if (!availableJobs) {
      for (let i in controlledRoomJobs) {
        room.memory.jobs[controlledRoomJobs[i]] = 0;
      }
    }
    if (availableJobs.length !== controlledRoomJobs.length) {
      let jobsToAdd = _.difference(_.keys(room.memory.jobs), controlledRoomJobs);
      for (let i in jobsToAdd) {
        room.memory.jobs[jobsToAdd[i]] = 0;
      }
    }
  }
}

import { controlledRoomJobs, /* partsCost */ } from "../config/jobs";

/**
 * Orchestrator is the brain of each Colony. It provides several useful APIs to
 * perform global managerial tasks within a Colony, including managing memory,
 * job assignment, job priorities, mining/construction positions, etc.
 */
namespace Orchestrator {
  /**
   * Creates a unique guid for a creep/queued task.
   */
  export function getGuid() {
    if (!Memory.guid || Memory.guid > 100) {
      Memory.guid = 0;
    }

    Memory.guid = Memory.guid + 1;
    return Memory.guid;
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
  export function refreshJobAssignments(room: Room) {
    // Check if all job assignments are initialised properly.
    if (_.keys(room.memory.jobs).length !== _.keys(controlledRoomJobs).length) {
      let jobsToAdd = _.difference(controlledRoomJobs, _.keys(room.memory.jobs));
      for (let i in jobsToAdd) {
        room.memory.jobs[jobsToAdd[i]] = 0;
      }
    }
  }

  /**
   * Calculates the body part for the creeps we'll have to spawn. Should return
   * body parts which are proportional to a creep's role.
   *
   * @param role The expected creep role.
   * @param room The room in which this creep will live.
   */
  export function getBodyParts(/* role: string, room: Room */) {
    let bodyParts: string[] = [];

    // TODO: Here's how this method would work:
    //
    // So here we have an API call to build the required bodyparts for our
    // creep. First it checks the maximum amount of energy the passed room can
    // hold, as well as how much energy the entire room has right now, and
    // determines the "room tier" (with arbitrary energy limits for each tier).
    //
    // Then, it will generate the required bodypart proportions based on the
    // passed role. For example, a Harvester should have 50% WORK and 50% MOVE
    // parts, a Builder should have 50% MOVE parts, 25% CARRY parts, and 25%
    // WORK parts, and so on, and so on.
    //
    // Now, it will try to add as much proportioned body parts as possible
    // without passing the room tier limit. And now we have the body parts for
    // our new creep!

    return bodyParts;
  }
}

export default Orchestrator;

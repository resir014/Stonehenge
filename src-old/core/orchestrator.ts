import * as Config from '../config/config'
import { log } from '../lib/logger/log'
import { controlledRoomJobs, bodyTemplates } from '../config/jobs'

/**
 * Orchestrator is the brain of each Colony. It provides several useful APIs to
 * perform global managerial tasks within a Colony, including managing memory,
 * job assignment, job priorities, mining/construction positions, etc.
 */
namespace Orchestrator {
  /**
   * Creates a unique guid for a creep/queued task.
   *
   * @export
   * @returns {number} The current guid.
   */
  export function getGuid(): number {
    if (!Memory.guid || Memory.guid > 10000) {
      Memory.guid = 0
    }

    return Memory.guid
  }

  /**
   * Refreshes the job assignment available in a room.
   *
   * @todo If `manualJobControl` is set to `false` in the room memory, it's
   * going to invoke a method which will ~automagically~ define job assignments
   * based on some parameters. We don't even have that function yet.
   *
   * @export
   * @param {Room} room The target room.
   */
  export function refreshJobAssignments(room: Room): void {
    // Check if all job assignments are initialised properly.
    if (_.keys(room.memory.jobs).length !== _.keys(controlledRoomJobs).length) {
      const jobsToAdd = _.difference(controlledRoomJobs, _.keys(room.memory.jobs))
      for (const i in jobsToAdd) {
        room.memory.jobs[jobsToAdd[i]] = 0
      }
    }
  }

  /**
   * Calculates the body part for the creeps we'll have to spawn. Should return
   * body parts which are proportional to a creep's role.
   *
   * @export
   * @param {string} role The expected creep role.
   * @param {Spawn} spawn The expected spawn where the creep is going to spawn.
   * @returns {string[]} The body parts proportional to a creep's role
   */
  export function getBodyParts(role: string, spawn: Spawn): string[] {
    // So here we have an API call to build the required bodyparts for our
    // creep. This utilizes tinnvec's super-useful spawn prototype extensions,
    // where you can generate the largest bodypart a room can build based on a
    // build template.
    //
    // The bodypart templates included should be proportional enough based on
    // the passed role. For example:
    //
    // * Harvesters should have 50% WORK parts and 50% MOVE parts.
    // * Builders should have 50% MOVE parts, 25% CARRY parts, and 25% WORK
    //   parts.
    // * Haulers should have 50% CARRY parts and 50% MOVE parts.
    //
    // If you dont like these proportions, free to modify the templates based
    // on your needs at `config/jobs.ts`.

    let bodyParts: string[] = []

    switch (role) {
      case 'hauler':
        bodyParts = spawn.getLargestBuildableBodyFromTemplate(bodyTemplates.haulers)
        break
      case 'harvester':
        bodyParts = spawn.getLargestBuildableBodyFromTemplate(bodyTemplates.harvesters)
        break
      default:
        bodyParts = spawn.getLargestBuildableBodyFromTemplate(bodyTemplates.workers)
        break
    }

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug(`Got bodyparts: ${bodyParts}`)
    }

    return bodyParts
  }

  /**
   * Converts global control level (GCL) to control points.
   *
   * @export
   * @param {number} gcl The GCL to convert
   * @returns {number} The control points.
   */
  export function gclToControlPoints(gcl: number): number {
    return Math.pow(gcl - 1, GCL_POW) * GCL_MULTIPLY;
  }

  /**
   * Converts control points to GCL.
   *
   * @export
   * @param {number} points The points to convert.
   * @returns {number} The GCL.
   */
  export function controlPointsToGcl(points: number): number {
    return Math.floor(Math.pow(points / GCL_MULTIPLY, 1 / GCL_POW) + 1);
  }
}

export default Orchestrator

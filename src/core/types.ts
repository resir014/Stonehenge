/**
 * Implementable interface for the Orchestrator.
 *
 * @export
 * @interface IOrchestrator
 */
export interface IOrchestrator {
  /**
   * Creates a unique guid for a creep/queued task.
   *
   * @returns {number} The current free guid.
   * @memberof IOrchestrator
   */
  getGuid(): number
  /**
   * Refreshes the job assignment available in a room.
   *
   * @param {Room} room The target room.
   * @memberof IOrchestrator
   */
  refreshJobAssignments(room: Room): void
  /**
   * Calculates the body part for the creeps we'll have to spawn. Should return
   * body parts which are proportional to a creep's role.
   *
   * @param {string} role The expected creep role.
   * @param {Spawn} spawn The expected spawn where the creep is going to spawn.
   * @returns {string[]} The body parts proportional to a creep's role
   * @memberof IOrchestrator
   */
  getBodyParts(role: string, spawn: Spawn): string[]
  /**
   * Converts global control level (GCL) to control points.
   *
   * @param {number} gcl The GCL to convert
   * @returns {number} The control points.
   * @memberof IOrchestrator
   */
  gclToControlPoints(gcl: number): number
  /**
   * Converts control points to GCL.
   *
   * @param {number} points The points to convert.
   * @returns {number} The GCL.
   * @memberof IOrchestrator
   */
  controlPointsToGcl(points: number): number
}

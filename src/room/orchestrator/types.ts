export interface IRoomOrchestrator {
  /**
   * Refreshes the job assignment available in a room.
   *
   * @param {Room} room The target room.
   * @memberof IOrchestrator
   */
  refreshJobAssignments(room: Room): void
}

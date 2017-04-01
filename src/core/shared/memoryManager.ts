/**
 * Check memory for null or out of bounds custom objects
 *
 * @export
 */
export function checkOutOfBounds() {
  if (!Memory.creeps) {
    Memory.creeps = {};
  }
  if (!Memory.flags) {
    Memory.flags = {};
  }
  if (!Memory.rooms) {
    Memory.rooms = {};
  }
  if (!Memory.spawns) {
    Memory.spawns = {};
  }
  if (!Memory.modules) {
    Memory.modules = {};
  }
}

/**
 * Creates a unique guid for a module/queued task.
 *
 * @export
 * @returns The guid used for a task
 */
export function getGuid() {
  if (!Memory.guid || Memory.guid > 100) {
    Memory.guid = 0;
  }

  Memory.guid = Memory.guid + 1;
  return Memory.guid;
}

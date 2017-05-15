/*
 * Stonehenge - A modular colony management engine for Screeps.
 *
 * Stonehenge is a next-generation colony management system for the game Screeps.
 * It is developed in TypeScript, and designed with modularity in mind.
 */

import * as Profiler from 'screeps-profiler'

import * as Config from './config/config'
import { RoomManager } from './room/roomManager'
import { log } from './lib/logger/log'

import { loadStructureSpawnPrototypes } from './prototypes/StructureSpawn.prototype'

// This is an example for using a config variable from `config.ts`.
// NOTE: this is used as an example, you may have better performance
// by setting USE_PROFILER through webpack, if you want to permanently
// remove it on deploy
// Start the profiler
if (Config.USE_PROFILER) {
  Profiler.enable()
}

// Prototype extensions
loadStructureSpawnPrototypes()

log.info(`loading revision: ${__REVISION__}`)

function mloop(): void {
  // Check memory for null or out of bounds custom objects.
  checkOutOfBoundsMemory()

  // For each controlled room, run colony actions.
  for (const i in Game.rooms) {
    const room: Room = Game.rooms[i]

    const colony = new RoomManager(room)
    colony.run()
  }
}

/**
 * Check memory for null or out of bounds custom objects
 */
function checkOutOfBoundsMemory(): void {
  if (!Memory.guid) {
    Memory.guid = 0
  }

  if (!Memory.creeps) {
    Memory.creeps = {}
  }
  if (!Memory.flags) {
    Memory.flags = {}
  }
  if (!Memory.rooms) {
    Memory.rooms = {}
  }
  if (!Memory.spawns) {
    Memory.spawns = {}
  }
}

/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export const loop = !Config.USE_PROFILER ? mloop : Profiler.wrap(mloop);

/*
 * Stonehenge - A modular colony management engine for Screeps.
 *
 * Stonehenge is a next-generation colony management system for the game Screeps.
 * It is developed in TypeScript, and designed with modularity in mind.
 */

import * as profiler from "screeps-profiler";

import * as Config from "./config/config";
import { RoomManager } from "./room/roomManager";
import { log } from "./lib/logger/log";

import { loadStructurePrototypes } from "./prototypes/Structure.prototype";
import { loadStructureSpawnPrototypes } from "./prototypes/StructureSpawn.prototype";

// This is an example for using a config variable from `config.ts`.
if (Config.USE_PATHFINDER) {
  PathFinder.use(true);
}

// Prototype extensions
loadStructurePrototypes();
loadStructureSpawnPrototypes();

// Enable the profiler
profiler.enable();

log.info("Scripts bootstrapped.");

/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export function loop() {
  // Run the Stonehenge core engine.
  profiler.wrap(() => {
    // Check memory for null or out of bounds custom objects.
    checkOutOfBoundsMemory();

    // For each controlled room, run colony actions.
    for (let i in Game.rooms) {
      let room: Room = Game.rooms[i];

      let colony = new RoomManager(room);
      colony.run();
    }
  });
}

/**
 * Check memory for null or out of bounds custom objects
 */
function checkOutOfBoundsMemory() {
  if (!Memory.guid || Memory.guid > 100) {
    Memory.guid = 0;
  }

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
}

/*
 * Stonehenge - A modular colony management engine for Screeps.
 *
 * Stonehenge is a next-generation colony management system for the game Screeps.
 * It is developed in TypeScript, and designed with modularity in mind.
 */

import * as MemoryManager from "./core/shared/memoryManager";
import * as Config from "./config/config";
import * as ModuleConfig from "./config/modules";
import ControlledRoomColony from "./colony/controlledRoom";
import { log } from "./lib/logger";
import { startProfiling, saveProfilerStats } from "./lib/profiler";

import CreepBuilder from "./modules/creepBuilder";
import CreepBodyPartsBuilder from "./modules/bodyPartsBuilder";

// This is an example for using a config variable from `config.ts`.
if (Config.USE_PATHFINDER) {
  PathFinder.use(true);
}

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
  startProfiling();

  MemoryManager.checkOutOfBounds();
  bootstrapModules();

  // For each controlled room, run colony actions.
  for (let i in Game.rooms) {
    let room = Game.rooms[i];

    let colony = new ControlledRoomColony(room);
    colony.run();
  }

  saveProfilerStats();
}

function bootstrapModules() {
  // Include the modules you want to bootstrap here.
  new CreepBuilder().bootstrap();
  new CreepBodyPartsBuilder(ModuleConfig.bodyPartsBuilder).bootstrap();
}

/*
 * Stonehenge - A modular colony management engine for Screeps.
 *
 * Stonehenge is a next-generation colony management system for the game Screeps.
 * It is developed in TypeScript, and designed with modularity in mind.
 */

import * as Config from "./config/config";
import { Stonehenge } from "./core/stonehenge";
import { log } from "./lib/logger/log";
import { startProfiling, saveProfilerStats } from "./lib/profiler/profile";

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

  // Run the Stonehenge core engine.
  let stonehenge = new Stonehenge();
  stonehenge.run();

  saveProfilerStats();
}

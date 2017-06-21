/*
 * Stonehenge - A modular colony management engine for Screeps.
 *
 * Stonehenge is a next-generation colony management system for the game Screeps.
 * It is developed in TypeScript, and designed with modularity in mind.
 */

import * as Profiler from 'screeps-profiler'

import * as Config from './config/config'
import { Kernel } from './core/kernel'
import initCli from './core/cli'
import { log } from './lib/logger'
// import InitProcess from './processes/init'

import { loadStructureSpawnPrototypes } from './prototypes/StructureSpawn.prototype'

// const deserializationTime = ProfileMemoryDeserialization()

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
if ((Memory as KernelMemory).pmem == null) (Memory as KernelMemory).pmem = {}
const kernel: IKernel = global.kernel = new Kernel(() => (Memory as KernelMemory))
initCli(global, Memory, kernel)

let isInitTick = true
const minCpuAlloc = 0.35
const minCpuAllocInverseFactor = (1 - minCpuAlloc) * 10e-8

function mloop(): void {
  /* const memoryInitializationTime = isInitTick
    ? (isInitTick = false, deserializationTime)
    : ProfileMemoryDeserialization() */
  // initTickVolatile(global)
  const bucket = Game.cpu.bucket
  const cpuLimitRatio = (bucket * bucket) * minCpuAllocInverseFactor + minCpuAlloc
  // TODO: Consider skipping load if on the same shard as last time? Consider costs of loss of one-tick-volatility storage.
  kernel.loadProcessTable()
  kernel.run(Game.cpu.limit * cpuLimitRatio)
  kernel.saveProcessTable()
  // recordStats(cpuOverhead, memoryInitializationTime)
  isInitTick = false
}

/* function ProfileMemoryDeserialization(): number {
  const start = Game.cpu.getUsed()
  return Game.cpu.getUsed() - start
} */

/**
 * Check memory for null or out of bounds custom objects
 */
/*function checkOutOfBoundsMemory(): void {
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
}*/

/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export const loop = !Config.USE_PROFILER ? mloop : Profiler.wrap(mloop)

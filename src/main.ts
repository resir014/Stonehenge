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
import { boot } from './core/bootstrap'
import { log } from './lib/logger'

import { InitProcess } from './processes/InitProcess'

import { loadStructureSpawnPrototypes } from './prototypes/StructureSpawn.prototype'

// Initialise the kernel + memory.
const kmem = Memory as KernelMemory
if (!kmem.pmem) kmem.pmem = {}
const kernel: IKernel = global.kernel = new Kernel(() => kmem)

// Initialise command-line tool.
initCli(global, Memory, kernel)

// Start the profiler
if (Config.USE_PROFILER) {
  Profiler.enable()
}

// Prototype extensions
loadStructureSpawnPrototypes()

log.info(`bootstrapping code | revision: ${__REVISION__} | current CPU: ${Game.cpu.getUsed()}`)

let isInitTick = true
const minCpuAlloc = 0.35
const minCpuAllocInverseFactor = (1 - minCpuAlloc) * 10e-8

function mloop(): void {
  const bucket = Game.cpu.bucket
  const cpuLimitRatio = (bucket * bucket) * minCpuAllocInverseFactor + minCpuAlloc

  // TODO: Consider skipping load if on the same shard as last time? Consider costs of loss of one-tick-volatility storage.
  kernel.loadProcessTable()
  kernel.run(Game.cpu.limit * cpuLimitRatio)
  kernel.saveProcessTable()

  if (kernel.getProcessCount() === 0) {
    boot(kernel, InitProcess)
  }
  // recordStats(cpuOverhead, memoryInitializationTime)
  isInitTick = false
}

/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export const loop = !Config.USE_PROFILER ? mloop : () => { Profiler.wrap(mloop) }

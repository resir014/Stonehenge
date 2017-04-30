// BEGIN Extended prototypes

interface Structure {
  needEnergy(): boolean
}

interface StructureSpawn {
  getLargestBuildableBodyFromSet(potentialBodies: string[][]): string[]
  getLargestBuildableBodyFromTemplate(bodyTemplate: string[], maxIterations?: number): string[]
  findOptimalMoveCountForBody(body: string[], terrain?: 'road' | 'plain' | 'swamp', fullCarry?: boolean): number
}

// END Extended prototypes

/**
 * Extended memory objects.
 */
interface Memory {
  creeps: { [key: string]: any }
  flags: { [key: string]: any }
  rooms: { [key: string]: any }
  spawns: { [key: string]: any }
  guid: number
  log: any
  profiler: any
}

/**
 * Interface for the global objects.
 */
interface Global {
  /**
   * Tweak your Logger settings using this global.
   */
  log: {
    level: number,
    showSource: boolean,
    showTick: boolean
  }

  /**
   * Prints out a table of the global memory stats.
   */
  printMemProfilerStats: any;
}

declare function require(path: string): any

/**
 * Global objects that can be called from the Screeps console.
 */
declare const global: Global

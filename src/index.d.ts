declare function require(path: string): any;

/**
 * Extended memory objects.
 */
interface Memory {
  creeps: { [key: string]: any };
  flags: { [key: string]: any };
  rooms: { [key: string]: any };
  spawns: { [key: string]: any };
  guid: number;
  log: any;
  profiler: any;
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
  };

  /**
   * Prints out a table of the global memory stats.
   */
  printMemProfilerStats: any;
}

/**
 * Global objects that can be called from the Screeps console.
 */
declare const global: Global;

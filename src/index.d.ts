// BEGIN Extended prototypes

interface Structure {
  /**
   * Checks if a certain structure needs to be refilled with energy.
   *
   * @returns {boolean} true if a certain structure needs to be refilled with energy.
   *
   * @memberof Structure
   */
  needEnergy(): boolean
}

interface StructureSpawn {
  /**
   * Gets the largest buildable body parts from a certain set of available body parts.
   *
   * @param {string[][]} potentialBodies A list of potential body parts for the spawned creep.
   * @returns {string[]} the largest buildable body part.
   *
   * @memberof StructureSpawn
   */
  getLargestBuildableBodyFromSet(potentialBodies: string[][]): string[]
  /**
   * Gets the largest buildable body parts for a certain body part template.
   *
   * @param {string[]} bodyTemplate The target body template.
   * @param {number} [maxIterations] Maximum iterations.
   * @returns {string[]} the largest buildable body part.
   *
   * @memberof StructureSpawn
   */
  getLargestBuildableBodyFromTemplate(bodyTemplate: string[], maxIterations?: number): string[]
  /**
   * Gets the optimal amount of `MOVE` parts for a certain body part.
   *
   * @param {string[]} body The body parts to be calulated (without `MOVE` parts).
   * @param {('road' | 'plain' | 'swamp')} [terrain] The target terrain type for a creep.
   * @param {boolean} [fullCarry] set to `true` if the spawned creep is carrying the max amount of items.
   * @returns {number} the optimal count of `MOVE` parts.
   *
   * @memberof StructureSpawn
   */
  findOptimalMoveCountForBody(body: string[], terrain?: 'road' | 'plain' | 'swamp', fullCarry?: boolean): number
}

// END Extended prototypes

/**
 * Extended memory objects.
 */
interface Memory {
  creeps: { [key: string]: CreepMemory }
  flags: { [key: string]: FlagMemory }
  rooms: { [key: string]: RoomMemory }
  spawns: { [key: string]: SpawnMemory }
  guid: number
  log: any
  profiler: any
}

interface CreepMemory {
  role: string
  assignedSource: Source
}

interface RoomMemory {
  creeps: {
    [key: string]: CreepMemory
  }
  jobs: {
    [key: string]: number
  }
}

declare const __REVISION__: string;

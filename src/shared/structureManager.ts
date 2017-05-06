import * as Config from '../config/config'
import { log } from '../lib/logger/log'

export class StructureManager {
  public structures: Structure[]
  public structureCount: number

  constructor(room: Room) {
    this.structures = room.find<Structure>(FIND_STRUCTURES)
    this.structureCount = _.size(this.structures)

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug('[StructureManager]' + this.structureCount + ' structures found.')
    }
  }

  /**
   * Get the storage objects available. This prioritizes StructureContainer,
   * but will fall back to an extension, or to the spawn if need be.
   */
  public getStorageObjects(): Structure[] {
    let targets: Structure[] = this.structures.filter((structure: StructureContainer) => {
      return ((structure.structureType === STRUCTURE_CONTAINER)
        && _.sum(structure.store) < structure.storeCapacity)
    })

    // if we can't find any storage containers, use either the extension or spawn.
    if (targets.length === 0) {
      targets = this.structures.filter((structure: StructureExtension) => {
        return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity)
      })
    }

    return targets
  }

  /**
   * Get source withdrawal points. This prioritizes StructureStorage, but will
   * fall back to StructureContainer if need be.
   */
  public getSourceWithdrawalPoints(): Structure[] | undefined {
    let targets: Structure[] = []

    // First pass: prioritise StructureStorage.
    targets = this.structures.filter((structure: Structure) => {
      if (structure.structureType === STRUCTURE_STORAGE) {
        let storage = structure as Storage
        if (_.sum(storage.store) > 500) {
          return storage
        }
      }
    })

    // Second pass: if no StructureStorage is found, find any containers.
    if (targets.length === 0) {
      targets = this.structures.filter((structure: Structure) => {
        if (structure.structureType === STRUCTURE_CONTAINER) {
          let storage = structure as Container
          if (_.sum(storage.store) > 500) {
            return storage
          }
        }
      })
    }

    return targets || undefined
  }

  /**
   * Get the energy dropoff points available. This prioritizes the spawn,
   * falling back on extensions, then towers, and finally containers.
   */
  public getDropOffPoints(): Structure[] {
    let targets: Structure[] = this.structures.filter((structure: Structure) => {
      if (structure instanceof Spawn) {
        return ((structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity)
      }
    })

    // If the spawn is full, we'll find any extensions/towers.
    if (targets.length === 0) {
      targets = this.structures.filter((structure: Structure) => {
        if (structure instanceof StructureExtension) {
          return ((structure.structureType === STRUCTURE_EXTENSION)
            && structure.energy < structure.energyCapacity)
        }
      })
    }

    // Or if that's filled as well, look for towers.
    if (targets.length === 0) {
      targets = this.structures.filter((structure: StructureTower) => {
        return ((structure.structureType === STRUCTURE_TOWER)
          && structure.energy < structure.energyCapacity - (structure.energyCapacity * 0.5))
      })
    }

    // Otherwise, look for storage containers.
    if (targets.length === 0) {
      targets = this.structures.filter((structure: StructureStorage) => {
        return ((structure.structureType === STRUCTURE_STORAGE) && _.sum(structure.store) < structure.storeCapacity)
      })
    }

    return targets
  }
}

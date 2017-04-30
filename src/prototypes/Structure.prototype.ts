export const loadStructurePrototypes = () => {
  Structure.prototype.needEnergy = function (): boolean {
    if (this.structureType !== STRUCTURE_EXTENSION &&
      this.structureType !== STRUCTURE_TOWER) {
      return false
    } else if (this.structureType === STRUCTURE_TOWER) {
      return this.energy < 100
    }
    return this.energy < this.energyCapacity
  }
}

/**
 * The base Creep class.
 *
 * @export
 * @class BaseCreep
 */
export default class BaseCreep {
  public memory: Memory;
  protected creep: Creep;
  protected state: string;

  /**
   * Creates an instance of BaseCreep.
   *
   * @param {Creep} creep The creep.
   */
  constructor(creep: Creep) {
    this.creep = creep;
    this.memory = creep.memory;
    this.state = this.memory.state;
  }
}

import BaseCreep from "../creep";

/**
 * Shared roles for all Creeps.
 *
 * @export
 * @default
 * @class BaseRole
 */
export default class BaseRole extends BaseCreep {
  public state: string;

  /**
   * Creates an instance of BaseRole.
   *
   * @param {Creep} creep The creep.
   */
  constructor(creep: Creep) {
    super(creep);
  }
}

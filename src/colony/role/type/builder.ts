import { Profile } from "../../../lib/profiler";
import { Role } from "../role";

import { ConstructionSiteManager } from "../../../shared/constructionSiteManager";

/**
 * A Builder builds construction sites. When given a list of structures to
 * build, it will always builds by its order in the array, so it might be wise
 * to pass a pre-sorted array of construction sites to build.
 *
 * @todo Refactor this.
 */
export class Harvester extends Role {
  private constructionSiteManager: ConstructionSiteManager;

  constructor(creep: Creep) {
    super(creep);
    this.constructionSiteManager = new ConstructionSiteManager(creep.room);
  }

  /**
   * Run the module.
   */
  @Profile
  public run() {
    if (!this.memory.state) {
      this.memory.state = "idle";
    }

    if (_.sum(this.creep.carry) === 0) {
      this.memory.state = "idle";
    }

    if (_.sum(this.creep.carry) < this.creep.carryCapacity && this.memory.state !== "building") {
      this.tryRetrieveEnergy();
    } else {
      this.memory.state = "building";
      let targetConstructionSite = this.getConstructionSite(this.constructionSiteManager.constructionSites);

      if (targetConstructionSite) {
        if (this.creep.pos.isNearTo(targetConstructionSite)) {
          this.creep.build(targetConstructionSite);
        } else {
          this.moveTo(targetConstructionSite);
        }
      }
    }
  }

  /**
   * Gets a prioritised list of construction sites to maintain.
   * @todo This really needs to be refactored to Orchestrator.
   *
   * @param constructionSites The list of construction sites to sort
   */
  private getConstructionSite(constructionSites: ConstructionSite[]) {
    let target: ConstructionSite;

    if (this.constructionSiteManager.roads.length > 0) {
      target = this.constructionSiteManager.roads[0];
    } else if (this.constructionSiteManager.extensions.length > 0) {
      target = this.constructionSiteManager.extensions[0];
    } else if (this.constructionSiteManager.containers.length > 0) {
      target = this.constructionSiteManager.containers[0];
    } else if (this.constructionSiteManager.walls.length > 0) {
      target = this.constructionSiteManager.walls[0];
    } else if (this.constructionSiteManager.ramparts.length > 0) {
      target = this.constructionSiteManager.ramparts[0];
    } else if (this.constructionSiteManager.towers.length > 0) {
      target = this.constructionSiteManager.towers[0];
    } else if (this.constructionSiteManager.storages.length > 0) {
      target = this.constructionSiteManager.storages[0];
    } else {
      target = constructionSites[0];
    }

    return target;
  }
}

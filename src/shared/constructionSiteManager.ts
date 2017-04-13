import * as Config from "../config/config";
import { log } from "../lib/logger/log";

export class ConstructionSiteManager {
  public constructionSites: ConstructionSite[];
  public constructionSiteCount: number;

  public roads: ConstructionSite[] = [];
  public extensions: ConstructionSite[] = [];
  public containers: ConstructionSite[] = [];
  public walls: ConstructionSite[] = [];
  public ramparts: ConstructionSite[] = [];
  public towers: ConstructionSite[] = [];
  public storages: ConstructionSite[] = [];

  constructor(room: Room) {
    this.constructionSites = room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
    this.constructionSiteCount = _.size(this.constructionSites);
    this.getConstructionSites();

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug("[ConstructionSiteManager]", this.constructionSiteCount + " construction sites in room" +
        room.name + ".");
    }
  }

  private getConstructionSites() {
    this.roads = this.constructionSites.filter((structure) => {
      return structure.structureType === STRUCTURE_ROAD;
    });

    this.extensions = this.constructionSites.filter((structure) => {
      return structure.structureType === STRUCTURE_EXTENSION;
    });

    this.containers = this.constructionSites.filter((structure) => {
      return structure.structureType === STRUCTURE_CONTAINER;
    });

    this.walls = this.constructionSites.filter((structure) => {
      return structure.structureType === STRUCTURE_WALL;
    });

    this.ramparts = this.constructionSites.filter((structure) => {
      return structure.structureType === STRUCTURE_RAMPART;
    });

    this.towers = this.constructionSites.filter((structure) => {
      return structure.structureType === STRUCTURE_TOWER;
    });

    this.storages = this.constructionSites.filter((structure) => {
      return structure.structureType === STRUCTURE_STORAGE;
    });
  }
}

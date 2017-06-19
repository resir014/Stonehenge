import * as Config from '../config/config'
import { log } from '../lib/logger/log'

export class ResourceManager {
  public resources: Resource[]
  public resourceCount: number

  constructor(room: Room) {
    this.resources = room.find<Resource>(FIND_DROPPED_RESOURCES)
    this.resourceCount = _.size(this.resources)

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug('[ResourceManager]' + this.resourceCount + ' dropped resources found.')
    }
  }
}

import * as Config from '../../config/config';
import { log } from '../../lib/logger/log';
import { Profile } from '../../lib/profiler/profile';
import Orchestrator from '../../core/orchestrator';

import { Harvester } from './role/harvester';
import { Hauler } from './role/hauler';
import { Upgrader } from './role/upgrader';
import { Builder } from './role/builder';

/**
 * This class is basically a "creep manager" - it's nearly the same in
 * functionality as my old `CreepManager` class, but with a more well-structured
 * class tree.
 */
export class CreepManager {
  protected room: Room;
  protected memory: { [key: string]: any };
  protected creeps: Creep[];
  protected creepCount: number;

  private harvesters: Creep[];
  private haulers: Creep[];
  private builders: Creep[];
  private upgraders: Creep[];
  private wallMaintainers: Creep[];
  private rampartMaintainers: Creep[];
  private roadMaintainers: Creep[];
  private defenders: Creep[];
  private mineralMiners: Creep[];

  /**
   * Creates an instance of CreepManager.
   * @param {Room} room The current room.
   *
   * @memberOf CreepManager
   */
  constructor (room: Room) {
    this.room = room;
    this.memory = room.memory;

    this.creeps = this.room.find<Creep>(FIND_MY_CREEPS);
    this.creepCount = _.size(this.creeps);
    this.loadCreeps();
  }

  /**
   * Run the module.
   */
  @Profile()
  public run (): void {
    this.buildMissingCreeps();

    this.harvesters.forEach((creep: Creep) => {
      let harvester = new Harvester(creep);
      harvester.run();
    });
    this.haulers.forEach((creep: Creep) => {
      let hauler = new Hauler(creep);
      hauler.run();
    });
    this.upgraders.forEach((creep: Creep) => {
      let upgrader = new Upgrader(creep);
      upgrader.run();
    });
    this.builders.forEach((creep: Creep) => {
      let builder = new Builder(creep);
      builder.run();
    });
  }

  /**
   * Filters out each Creep by its associated role.
   */
  private loadCreeps (): void {
    this.harvesters = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'harvester';
    });
    this.haulers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'hauler';
    });
    this.builders = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'builder';
    });
    this.upgraders = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'upgrader';
    });
    this.wallMaintainers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'wallMaintainer';
    });
    this.rampartMaintainers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'rampartMaintainer';
    });
    this.roadMaintainers = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'roadMaintainer';
    });
    this.defenders = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'defender';
    });
    this.mineralMiners = this.creeps.filter((creep: Creep) => {
      return creep.memory.role === 'mineralMiner';
    });
  }

  /**
   * Builds any missing creeps for that colony.
   */
  @Profile()
  private buildMissingCreeps (): void {
    let bodyParts: string[] = [];

    let spawns: Spawn[] = this.room.find<Spawn>(FIND_MY_SPAWNS, {
      filter: (spawn: Spawn) => {
        return spawn.spawning === null;
      },
    });

    // TODO: This should be procedurally generated based on the number of energy
    // availabe + energy capacity of room. See Orchestrator.getBodyParts()
    bodyParts = [WORK, WORK, CARRY, MOVE];

    for (let spawn of spawns) {
      if (Config.ENABLE_DEBUG_MODE) {
        log.debug('Spawning from:', spawn.name);
      }

      if (spawn.canCreateCreep) {
        if (this.harvesters.length >= 1) {
          if (this.haulers.length < Memory.rooms[this.room.name].jobs.hauler) {
            bodyParts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            this.spawnCreep(spawn, bodyParts, 'hauler');
            break;
          } else if (this.harvesters.length < Memory.rooms[this.room.name].jobs.harvester) {
            bodyParts = [WORK, WORK, MOVE, MOVE];
            this.spawnCreep(spawn, bodyParts, 'harvester');
          } else if (this.upgraders.length < Memory.rooms[this.room.name].jobs.upgrader) {
            // In case we ran out of creeps.
            if (this.upgraders.length < 1) {
              bodyParts = [WORK, WORK, CARRY, MOVE];
            }
            this.spawnCreep(spawn, bodyParts, 'upgrader');
          } else if (this.builders.length < Memory.rooms[this.room.name].jobs.builder) {
            // In case we ran out of creeps.
            if (this.builders.length < 1) {
              bodyParts = [WORK, WORK, CARRY, MOVE];
            }
            this.spawnCreep(spawn, bodyParts, 'builder');
          }
        } else {
          if (this.harvesters.length < Memory.rooms[this.room.name].jobs.harvester) {
            bodyParts = [WORK, WORK, MOVE, MOVE];
            this.spawnCreep(spawn, bodyParts, 'harvester');
            break;
          }
        }
      }
    }
  }

  /**
   * Spawns a new creep.
   *
   * @param {Spawn} spawn
   * @param {string[]} bodyParts
   * @param {string} role
   * @returns
   */
  private spawnCreep (spawn: Spawn, bodyParts: string[], role: string): number {
    let guid: number = Orchestrator.getGuid();
    let status: number | string = spawn.canCreateCreep(bodyParts);

    let properties: { [key: string]: any } = {
      role,
      room: spawn.room.name,
    };

    if (Config.ENABLE_DEBUG_MODE) {
      log.debug(`Attempting to create new ${properties.role} in room ${properties.room}`);
    }

    status = _.isString(status) ? OK : status;
    if (status === OK) {
      Memory.guid = guid;
      let creepName: string = `(${guid}) ${spawn.room.name} - ${role}`;

      log.info('Started creating new creep: ' + creepName);
      if (Config.ENABLE_DEBUG_MODE) {
        log.debug('Body: ' + bodyParts);
        log.debug('guid: ' + guid);
      }

      status = spawn.createCreep(bodyParts, creepName, properties);

      return _.isString(status) ? OK : status;
    } else {
      if (Config.ENABLE_DEBUG_MODE) {
        log.error('Failed creating new creep: ' + status);
      }

      return status;
    }
  }
}

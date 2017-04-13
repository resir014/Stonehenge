import { Orchestrator } from "../core/orchestrator";
import { Profile } from "../lib/profiler/profile";
import { log } from "../lib/logger/log";

export class ColonyManager {
  protected room: Room;
  protected memory: { [key: string]: any };
  protected orchestrator: Orchestrator;

  /**
   * Creates an instance of ColonyManager.
   *
   * @param room The current room.
   */
  constructor(room: Room) {
    this.room = room;
    this.memory = room.memory;

    // We instantiate the Orchestrator object here. I know it's not that good
    // of an implementation, but hey, it's the only way I could think how this
    // thing would work.
    this.orchestrator = new Orchestrator(room);
  }

  /**
   * Run the module.
   */
  @Profile
  public run(): void {
    this.initializeMemory();
    this.refreshMiningPositions();
    this.cleanupCreepMemory();
    this.orchestrator.refreshJobAssignments();
  }

  /**
   * Checks memory for null or out of bounds objects
   */
  @Profile
  private initializeMemory() {
    if (!this.memory) {
      this.memory = {};
    }

    if (!this.memory.jobs) {
      this.memory.jobs = {};
    }

    if (!this.memory.manualJobControl) {
      this.memory.manualJobControl = true;
    }

    if (!this.memory.claimedFlags) {
      this.memory.claimedFlags = [];
    }
  }

  /**
   * Refreshes every memory entry of mining positions available on the room.
   */
  @Profile
  private refreshMiningPositions() {
    if (!this.memory) {
      this.memory = {};
    }

    if (!this.memory.unoccupiedMiningPositions) {
      this.memory.unoccupiedMiningPositions = [];
    }
  }

  /**
   * Remove dead creeps in memory.
   */
  @Profile
  private cleanupCreepMemory() {
    for (let name in Memory.creeps) {
      let creep: any = Memory.creeps[name];

      if (creep.room === this.room.name) {
        if (!Game.creeps[name]) {
          log.info("[MemoryManager] Clearing non-existing creep memory:", name);

          if (Memory.creeps[name].role === "sourceMiner") {
            // Push the now-dead creep's mining position back to the
            // unoccupiedMiningPosition entry
            this.memory.unoccupiedMiningPositions.push(Memory.creeps[name].occupiedMiningPosition);
          }

          delete Memory.creeps[name];
        }
      } else if (_.keys(Memory.creeps[name]).length === 0) {
        log.info("[MemoryManager] Clearing non-existing creep memory:", name);
        delete Memory.creeps[name];
      }
    }
  }
}

/**
 * The energy cost for each bodyparts in the game.
 */
export const partsCost = {
  MOVE: 50,
  WORK: 100,
  CARRY: 50,
  ATTACK: 80,
  RANGED_ATTACK: 150,
  TOUGH: 10,
  HEAL: 250,
  CLAIM: 600
};

/**
 * Job assignments for controlled room roles.
 */
export const controlledRoomJobs: string[] = [
  "harvester",
  "hauler",
  "builder",
  "upgrader",
  "wallMaintainer",
  "rampartMaintainer",
  "roadMaintainer",
  "defender",
  "mineralMiner"
];

/**
 * Job assignments for reserved room roles.
 */
export const reservedRoomJobs: string[] = [
  "scout",
  "reserver",
  "remoteBuilder",
  "remoteHarvester",
  "remoteHauler",
  "remoteUpgrader",
  "remoteDefender"
];

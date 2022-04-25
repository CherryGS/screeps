
export const CREEP_ROLE_BASIC = "Basicer";
export const CREEP_ROLE_CARRYER = "Carrier";
export const CREEP_ROLE_HARESTER = "Harvester";
export const CREEP_ROLE_BUILDER = "Builder";
export const CREEP_STATUS_PICKUP = "picking-up";
export const CREEP_STATUS_HARVEST = "harvesting";
export const CREEP_STATUS_REPAIR = "repairing";
export const CREEP_STATUS_BUILD = "building";
export const CREEP_STATUS_TRANSFER = "transferring";
export const CREEP_STATUS_WITHDRAW = "withdrawing";

export const EXTENSION_LEVEL_INFO = {
    1: [0, 0],
    2: [5, 50],
    3: [10, 50],
    4: [20, 50],
    5: [30, 50],
    6: [40, 50],
    7: [50, 100],
    8: [60, 200]
};

/**
 * 地图中草地的消耗
 */
export const MAP_COST_TERRIAN_GRASS = 4;
/**
 * 地图中沼泽的消耗
 */
export const MAP_COST_TERRIAN_SWAMP = 10;
/**
 * 地图中自然墙壁的消耗
 */
export const MAP_COST_TERRIAN_BLOCK = 255;

/**
 * 这里特指的是无法经过的建筑 , road / rampact 不在其中
 */
export const MAP_COST_STRUCTURE = 255;
import { eudis, random_move } from "@/modules/utils";
import { filter, sortBy } from "lodash";
import { CREEP_STATUS_TRANSFER, CREEP_STATUS_BUILD, CREEP_STATUS_REPAIR, CREEP_STATUS_WITHDRAW, CREEP_STATUS_UPGRADE } from "../const";
import { move_away } from "./utils";

/**
 * 修 / 建 , 不会主动开采能量
 * @param creep 
 * @returns 
 */
export function run_builder(creep: Creep) {
    let flag = false;
    if (creep.memory.status === undefined) {
        creep.memory.status = CREEP_STATUS_WITHDRAW;
        flag = true;
    }
    else if (creep.memory.status === CREEP_STATUS_WITHDRAW) {
        if (creep.memory.target === undefined) {
            creep.memory.status = CREEP_STATUS_BUILD;
            flag = true;
        }
    }
    else if (creep.memory.status === CREEP_STATUS_BUILD) {
        if (creep.store.energy == 0 || creep.memory.target === undefined) {
            creep.memory.status = CREEP_STATUS_REPAIR;
            flag = true;
        }
    }
    else if (creep.memory.status === CREEP_STATUS_REPAIR) {
        if (creep.store.energy == 0 || creep.memory.target === undefined) {
            creep.memory.status = CREEP_STATUS_UPGRADE;
            flag = true;
        }
    }
    else if (creep.memory.status === CREEP_STATUS_UPGRADE) {
        if (creep.store.energy == 0 || creep.memory.target === undefined) {
            creep.memory.status = undefined;
            flag = true;
        }
    }

    if (flag == true) {
        delete creep.memory.target;
    }

    if (creep.memory.status == CREEP_STATUS_WITHDRAW) {
        if (creep.memory.target === undefined) {
            const res = sortBy(
                creep.room.find(FIND_STRUCTURES, {
                    filter: (o) => {
                        return (o.structureType === STRUCTURE_STORAGE
                            || o.structureType === STRUCTURE_CONTAINER)
                            && o.store.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY);
                    }
                }),
                (o) => {
                    return eudis(o.pos, creep.pos);
                });
            if (res.length) { creep.memory.target = res[0].id; }
        }
        if (creep.memory.target === undefined) {
            move_away(creep);
            return;
        }
        const target: AnyStoreStructure = Game.getObjectById(creep.memory.target);
        const status_code = creep.withdraw(target, RESOURCE_ENERGY);
        if (status_code == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        else if (status_code == ERR_FULL || status_code == ERR_NOT_ENOUGH_ENERGY) {
            delete creep.memory.target;
        }
        else if (status_code != OK) {
            console.log(`Creep ${creep.name} 在从 ${target.id} 获取能量时出现错误 ${status_code} `);
        }
    }

    if (creep.memory.status == CREEP_STATUS_BUILD) {
        if (creep.memory.target === undefined) {
            const res = sortBy(
                creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (o) => { return o.my; }
                }),
                (o) => { return eudis(o.pos, creep.pos); });
            if (res.length) { creep.memory.target = res[0].id; }
        }
        if (creep.memory.target === undefined) {
            if (creep.memory.target === undefined) {
                if (filter(creep.room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y),
                    (o) => { return o.structureType == STRUCTURE_ROAD; }).length) {
                    random_move(creep);
                }
                return;
            }
            return;
        }
        const target: ConstructionSite = Game.getObjectById(creep.memory.target);
        if (target == null) { delete creep.memory.target; return; }
        const status_code = creep.build(target);
        if (status_code == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        else if (status_code == ERR_NOT_ENOUGH_RESOURCES) {
            delete creep.memory.target;
        }
        else if (status_code != OK) {
            console.log(`Creep ${creep.name} 在从 ${target.id} 获取能量时出现错误 ${status_code} `);
        }
    }

    // 修理 hits 小于 1M 的未满建筑 (防止前期拉墙太多)
    if (creep.memory.status == CREEP_STATUS_REPAIR) {
        if (creep.memory.target === undefined) {
            const res = sortBy(
                creep.room.find(FIND_STRUCTURES, {
                    filter: (o) => {
                        return o.hits != o.hitsMax && o.hits < 1e6;
                    }
                }),
                (o) => { return eudis(o.pos, creep.pos); });
            if (res.length) { creep.memory.target = res[0].id; }
        }
        if (creep.memory.target === undefined) {
            if (creep.memory.target === undefined) {
                move_away(creep);
                return;
            }
            return;
        }
        const target: Structure = Game.getObjectById(creep.memory.target);
        const status_code = creep.repair(target);
        if (status_code == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        else if (status_code == ERR_NOT_ENOUGH_ENERGY || target.hits == target.hitsMax) {
            delete creep.memory.target;
        }
        else if (status_code != OK) {
            console.log(`Creep ${creep.name} 在修 ${target.id} 时出现错误 ${status_code} `);
        }
    }

    if (creep.memory.status == CREEP_STATUS_UPGRADE) {
        if (creep.store.energy <= 0) { return; }
        if (creep.memory.target === undefined) {
            creep.memory.target = creep.room.controller.id;
        }
        const target: StructureController = Game.getObjectById(creep.memory.target);
        const status_code = creep.upgradeController(target);
        if (status_code == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        else if (status_code == ERR_NOT_ENOUGH_ENERGY) {
            delete creep.memory.target;
        }
        else if (status_code != OK) {
            console.log(`Creep ${creep.name} 在升级控制器 ${target.id} 时出现错误 ${status_code} `);
        }
    }
}
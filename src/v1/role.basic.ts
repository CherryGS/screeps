import { eudis } from "@/modules/utils";
import { sortBy } from "lodash";
import { CREEP_STATUS_BUILD, CREEP_STATUS_CARRY, CREEP_STATUS_HARVEST, CREEP_STATUS_PICKUP } from "./const";
import { assign_source } from "./source_manager";

/**
 * 切换 creep 状态并初始化一些变量
 * @param creep 
 */
function change_creep_status(creep: Creep) {
    // 状态切换
    let flag = false;
    if (creep.memory.status === undefined) {
        creep.memory.status = CREEP_STATUS_PICKUP;
        flag = true;
    }
    else if (creep.memory.status === CREEP_STATUS_PICKUP) {
        if (creep.store.getFreeCapacity() <= 0) {
            creep.memory.status = CREEP_STATUS_CARRY;
            flag = true;
        }
        else if (creep.memory.target === undefined) {
            creep.memory.status = CREEP_STATUS_HARVEST;
            flag = true;
        }
    }
    else if (creep.memory.status === CREEP_STATUS_HARVEST && creep.store.getFreeCapacity() <= 0) {
        creep.memory.status = CREEP_STATUS_BUILD;
        flag = true;
    }
    else if (creep.memory.status === CREEP_STATUS_BUILD && (creep.memory.target === undefined || creep.store.getUsedCapacity() <= 0)) {
        creep.memory.status = CREEP_STATUS_CARRY;
        flag = true;
    }
    else if (creep.memory.status === CREEP_STATUS_CARRY && creep.store.getUsedCapacity() <= 0) {
        creep.memory.status = undefined;
        flag = true;
    }
    // 如果发生切换 , 初始化 creep 部分内容
    if (flag) {
        delete creep.memory.target;
    }
}

/**
 * 自主 捡掉落能量 / 采能量 / 建造建筑 / 运输 / 升级控制器 (优先级按从前到后排序)
 * @param creep 
 */
export function run_basic(creep: Creep) {
    // 判断是否满足条件 ( work + carry + move )
    let flag = 0;
    for (const c of creep.body) {
        if (c.type === "work") { flag |= (1 << 0); }
        else if (c.type === "carry") { flag |= (1 << 1); }
        else if (c.type === "move") { flag |= (1 << 2); }
    }
    if (flag !== 0b111) {
        console.log(`role.basic 运行出错 , 因为指定的 ${creep.name} 不具有所有需要的身体部件`);
        return;
    }

    // 切换状态
    change_creep_status(creep);

    // 在捡垃圾状态时捡垃圾
    if (creep.memory.status === CREEP_STATUS_PICKUP) {
        const t = creep.memory.target;
        if (t === undefined || Game.getObjectById(t) === null) {
            const res = creep.room.find(FIND_DROPPED_RESOURCES);
            if (res.length) {
                creep.memory.target = res[0].id;
            }
        }
        if (t === undefined || Game.getObjectById(t) === null) { return; }
        const target: Resource = Game.getObjectById(t);
        const status_code = creep.pickup(target);
        if (status_code === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
    }

    // 在采集状态时采集能量
    if (creep.memory.status === CREEP_STATUS_HARVEST) {
        if (creep.memory.source === undefined) {
            creep.memory.source = assign_source(creep.pos);
        }
        const source = Game.getObjectById(creep.memory.source);
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: "#ffffff" } });
        }
    }

    // 在建造状态时开始建造
    if (creep.memory.status === CREEP_STATUS_BUILD) {
        const t: ConstructionSite = Game.getObjectById(creep.memory.target);
        // 如果该建筑工地已经完成则删除
        if (t === null) { delete creep.memory.target; }
        // 寻找建筑工地
        if (creep.memory.target === undefined) {
            const res = sortBy(creep.room.find(FIND_CONSTRUCTION_SITES), (o) => { return eudis(o.pos, creep.pos); });
            if (res.length) { creep.memory.target = res[0].id; }
        }
        // 还有就去建
        if (creep.memory.target !== undefined) {
            const construction: ConstructionSite = Game.getObjectById(creep.memory.target);
            if (creep.build(construction) === ERR_NOT_IN_RANGE) {
                creep.moveTo(construction, { visualizePathStyle: { stroke: "#ffffff" } });
            }
        }
    }

    // 在运输状态时运输能量到 Extension / Spawn
    if (creep.memory.status === CREEP_STATUS_CARRY) {
        if (creep.memory.target === undefined) {
            const target = creep.room.find(
                FIND_MY_STRUCTURES,
                {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                }
            )[0];
            // 如果还是 undefined 则说明全满 , 此时升级控制器
            if (target === undefined) { creep.memory.target = creep.room.controller.id; }
            else { creep.memory.target = target.id; }
        }
        const target: StructureSpawn | StructureExtension | StructureController = Game.getObjectById(creep.memory.target);
        const status_code = creep.transfer(target, RESOURCE_ENERGY);
        if (status_code === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        // 有可能 transfer 的目标刚刚没满现在满了 , 那么删除它
        else if (status_code === ERR_FULL) { delete creep.memory.target; }
    }
}
import { eudis, random_move } from "@/modules/utils";
import { filter, sortBy } from "lodash";
import { CREEP_STATUS_TRANSFER, CREEP_STATUS_WITHDRAW } from "../const";

/**
 * 将 Container 中的能量运到其他存储能量的部分中(最近的)
 */
export function run_carrier(creep: Creep) {
    let flag = false;
    if (creep.memory.status === undefined) {
        creep.memory.status = CREEP_STATUS_WITHDRAW;
        flag = true;
    }
    else if (creep.memory.status === CREEP_STATUS_WITHDRAW) {
        if (creep.memory.target === undefined || creep.store.getFreeCapacity() <= 0) {
            creep.memory.status = CREEP_STATUS_TRANSFER;
            flag = true;
        }
    }
    else if (creep.memory.status === CREEP_STATUS_TRANSFER) {
        if (creep.store.getUsedCapacity() <= 0 || creep.memory.target === undefined) {
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
                        return (o.structureType === STRUCTURE_CONTAINER)
                            && (o.store.getUsedCapacity() << 1) > (o.store.getCapacity());
                    }
                }),
                (o) => {
                    return eudis(o.pos, creep.pos);
                });
            if (res.length) { creep.memory.target = res[0].id; }
        }
        if (creep.memory.target === undefined) {
            if (filter(creep.room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y),
                (o) => { return o.structureType == STRUCTURE_ROAD; }).length) {
                random_move(creep);
            }
            return;
        }

        const target: StructureContainer = Game.getObjectById(creep.memory.target);
        const status_code = creep.withdraw(target, RESOURCE_ENERGY);
        if (status_code === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        else if (status_code === ERR_FULL || status_code === ERR_NOT_ENOUGH_RESOURCES) {
            delete creep.memory.target;
        }
        else if (status_code !== OK) {
            console.log(`Carrier ${creep.name} 在从 ${target.id} 提取资源时出现错误 ${status_code} `);
        }
    }

    if (creep.memory.status == CREEP_STATUS_TRANSFER) {
        if (creep.memory.target === undefined) {
            const res = sortBy(
                creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (o) => {
                        return (o.structureType == STRUCTURE_EXTENSION
                            || o.structureType == STRUCTURE_SPAWN
                            || o.structureType == STRUCTURE_STORAGE)
                            && o.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                }),
                (o) => {
                    return eudis(o.pos, creep.pos);
                });
            if (res.length) { creep.memory.target = res[0].id; }
        }
        if (creep.memory.target === undefined) {
            if (filter(creep.room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y),
                (o) => { return o.structureType == STRUCTURE_ROAD; }).length) {
                random_move(creep);
            }
            return;
        }

        const target: AnyStoreStructure = Game.getObjectById(creep.memory.target);
        const status_code = creep.transfer(target, RESOURCE_ENERGY);
        if (status_code === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        else if (status_code === ERR_FULL || status_code === ERR_NOT_ENOUGH_RESOURCES) {
            delete creep.memory.target;
        }
        else if (status_code !== OK) {
            console.log(`Carrier ${creep.name} 在运输资源到 ${target.id} 时出现错误 ${status_code} `);
        }
    }
}
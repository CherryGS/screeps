import { shuffle } from "lodash";
import { CREEP_STATUS_CARRY, CREEP_STATUS_HARVEST, CREEP_ROLE_MINER } from "./const";

function update_controller(creep: Creep) {
    if (creep.memory.status !== CREEP_STATUS_CARRY) { return -1; }
    let room = creep.room;
    let controller = room.controller;
    if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) { creep.moveTo(controller); }
}

function store_source(creep: Creep) {
    let room = creep.room;
}

function harvest_source(creep: Creep) {
    if (creep.memory.status !== CREEP_STATUS_HARVEST) { return -1; }
    let room = creep.room;
    if (creep.memory.source === undefined) {
        for (let mine of shuffle(room.find(FIND_SOURCES))) {
            creep.memory.source = mine.id;
        }
    }
    let source = Game.getObjectById(creep.memory.source);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) { creep.moveTo(source); }
}
export function work_source(creep: Creep) {
    if (creep.memory.role !== CREEP_ROLE_MINER) { return -1; }
    if (creep.memory.status === undefined) { creep.memory.status = CREEP_STATUS_HARVEST; }
    if (creep.memory.status === CREEP_STATUS_CARRY && creep.store.getUsedCapacity() == 0) {
        creep.memory.status = CREEP_STATUS_HARVEST;
    }
    if (creep.memory.status === CREEP_STATUS_HARVEST && creep.store.getFreeCapacity() == 0) {
        creep.memory.status = CREEP_STATUS_CARRY;
    }
    if (creep.memory.status === CREEP_STATUS_CARRY) { update_controller(creep); }
    if (creep.memory.status === CREEP_STATUS_HARVEST) { harvest_source(creep); }
    return 0;
}
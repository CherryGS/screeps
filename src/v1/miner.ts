import { shuffle } from "lodash";
import { CREEP_ROLE_MINER } from "./const";

function check_source_is_available(id: Id<Source>) {
    let mine = Game.getObjectById(id);

}
export function work_source(creep: Creep) {
    let room = creep.room;
    if (creep.memory.role !== CREEP_ROLE_MINER) { return -1; }
    if (creep.memory.source === null) {
        for (let mine of shuffle(room.find(FIND_SOURCES))) {
            creep.memory.source = mine.id;
        }
    }
    let source = Game.getObjectById(creep.memory.source);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) { creep.moveTo(source); }
}
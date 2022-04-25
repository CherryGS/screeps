import { lookAtAreaDo } from "@/modules/utils";
import { get_source } from "../source_manager";

export function run_harvester(creep: Creep) {
    if (creep.memory.source === undefined) {
        const id = get_source(creep.pos, false);
        creep.memory.source = id;
    }
    const id = creep.memory.source;
    if (id === undefined) { return; }
    const source: Source = Game.getObjectById(id);
    if (creep.memory.target === undefined) {
        const room = source.room;
        lookAtAreaDo(source.pos.x - 1, source.pos.x + 1, source.pos.y - 1, source.pos.y + 1, (x, y) => {
            if (x === source.pos.x && y === source.pos.y) { return false; }
            for (const c of room.lookForAt(LOOK_STRUCTURES, x, y)) {
                if (c.structureType == STRUCTURE_CONTAINER) {
                    creep.memory.target = c.id;
                    return true;
                }
            }
        });
    }
    // 给目标上锁
    source.room.memory.sources[source.id].reserved = 2;
    const target: StructureContainer = Game.getObjectById(creep.memory.target);
    if (creep.pos.x != target.pos.x || creep.pos.y != target.pos.y) { creep.moveTo(target); }
    else { creep.harvest(source); }
}
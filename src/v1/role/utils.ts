import { random_move } from "@/modules/utils";
import { filter } from "lodash";

/**
 * 离开道路
 * @param creep 
 * @returns 
 */
export function move_away(creep: Creep) {
    if (creep.memory.target === undefined) {
        if (filter(creep.room.lookForAt(LOOK_STRUCTURES, creep),
            (o) => { return o.structureType == STRUCTURE_ROAD; }).length != 0) {
            random_move(creep);
        }
        return;
    }
}
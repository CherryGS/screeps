import { CREEP_ROLE_BUILDER } from "../const";
import { create_creep_by_room } from "./utils";

export function create_builder(room: Room) {
    const cnt = 2 - room.find(FIND_MY_CREEPS,
        { filter: (o) => { return o.memory.role == CREEP_ROLE_BUILDER; } }
    ).length;
    if (cnt > 0) {
        create_creep_by_room(room, 1, ["work", "work", "carry", "carry", "move", "move"],
            CREEP_ROLE_BUILDER, { memory: { role: CREEP_ROLE_BUILDER } });
    }
}
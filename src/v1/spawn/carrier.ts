import { CREEP_ROLE_CARRYER } from "../const";
import { create_creep_by_room } from "./utils";

export function create_carrier(room: Room) {
    const cnt = 2 - room.find(FIND_MY_CREEPS,
        { filter: (o) => { return o.memory.role == CREEP_ROLE_CARRYER; } }
    ).length;
    if (cnt > 0) {
        create_creep_by_room(room, 1, ["carry", "carry", "move", "carry", "carry", "move", "carry", "carry", "move", "carry", "carry", "move"],
            CREEP_ROLE_CARRYER, { memory: { role: CREEP_ROLE_CARRYER } });
    }
}
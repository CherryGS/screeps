import { CREEP_ROLE_BASIC } from "../const";
import { get_all_pc } from "../source_manager";
import { create_creep_by_room } from "./utils";

export function create_basic(room: Room) {
    // 确定要生成的数量
    const cnt = 2 - room.find(FIND_MY_CREEPS,
        { filter: { memory: { role: CREEP_ROLE_BASIC } }, }
    ).length;
    if (cnt != 0) {
        create_creep_by_room(room, 1,
            ["work", "carry", "carry", "move", "move"],
            CREEP_ROLE_BASIC,
            { memory: { role: CREEP_ROLE_BASIC }, }
        );
    }
}
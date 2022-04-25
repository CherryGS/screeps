import { cacu_body_cost } from "@/modules/utils";
import { CREEP_ROLE_HARESTER } from "../const";
import { create_creep_by_room } from "./utils";

const menu: Array<BodyPartConstant[]> = [
    ["work", "work", "work", "work", "work", "move"],
    ["work", "work", "work", "work", "move"],
    ["work", "work", "work", "move"],
    ["work", "work", "move"],
];

export function create_harvester(room: Room) {
    const cnt = room.find(FIND_SOURCES).length - room.find(FIND_MY_CREEPS,
        { filter: (o) => { return o.memory.role == CREEP_ROLE_HARESTER; } }
    ).length;
    if (cnt > 0) {
        create_creep_by_room(room, 1, menu[3],
            CREEP_ROLE_HARESTER, { memory: { role: CREEP_ROLE_HARESTER } });
    }
}
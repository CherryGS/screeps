import { cacu_body_cost } from "@/modules/utils";
import { size } from "lodash";
import { CREEP_ROLE_BASIC, CREEP_ROLE_HARESTER } from "./const";

/**
 * 在指定的房间生成指定数量的定制 Creep
 * @param room 需要生成的房间
 * @param cnt 生成的数量
 * @param body Creep 的 Body
 * @param name Creep 的 Name
 * @param opts 其他的东西
 */
function create_creep_by_room(room: Room, cnt: number, body: BodyPartConstant[], name: string, opts?: SpawnOptions) {
    for (const spawn of room.find(FIND_MY_SPAWNS)) {
        if (cacu_body_cost(body) > room.energyAvailable) { return; }
        if (cnt <= 0) { break; }
        const spawn_status = spawn.spawning;
        // 如果没有在孵化其他 Creep 并且能量足够 , 那么孵化当前 Creep .
        name = name + Date.now();
        if (spawn_status === null) {
            const status_code = spawn.spawnCreep(body, name, opts);
            if (status_code == OK) {
                --cnt;
            } else {
                // 如果生成 Creep 失败则报错
                console.log(`ERROR ${status_code} CAUSED WHEN ${spawn.name} SPAWNING ${String(body)}. `);
            }
        }
    }
}

export function create_basic(room: Room) {
    // 确定要生成的数量
    const cnt = 5 - size(
        room.find(
            FIND_MY_CREEPS,
            { filter: { memory: { role: CREEP_ROLE_BASIC } }, }
        )
    );
    create_creep_by_room(room, cnt,
        ["work", "carry", "carry", "move", "move"],
        CREEP_ROLE_BASIC,
        { memory: { role: CREEP_ROLE_BASIC }, }
    );
}

export function create_harvester(room: Room) {
    const body: BodyPartConstant[] = ["work", "work", "work", "work", "work", "move"];
    if (room.energyAvailable < cacu_body_cost(body)) { return; }
    const num = room.find(FIND_SOURCES).length -
        room.find(
            FIND_MY_CREEPS,
            { filter: { memory: { role: CREEP_ROLE_HARESTER } } }
        ).length;
    create_creep_by_room(room, num, body, CREEP_ROLE_HARESTER);
}
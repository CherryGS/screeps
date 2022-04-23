import { cacu_body_cost } from "@/modules/utils";
import { size } from "lodash";
import { CREEP_ROLE_BASIC } from "./const";

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
        if (cnt <= 0) {
            break;
        }
        const spawn_status = spawn.spawning;
        // 如果没有在孵化其他 Creep 并且能量足够 , 那么孵化当前 Creep .
        if (spawn_status === null && spawn.store.energy >= cacu_body_cost(body)) {
            const status_code = spawn.spawnCreep(body, name, opts);
            if (status_code == OK) {
                --cnt;
                const spawningCreep = Game.creeps[name];
                room.visual.text("🛠️" + spawningCreep.memory.role, spawn.pos.x, spawn.pos.y);
            } else {
                // 如果生成 Creep 失败则报错
                console.log(`ERROR ${status_code} CAUSED WHEN ${spawn.name} SPAWNING. `);
            }
        }
    }
}

export function create_basic(room: Room) {
    // 确定要生成的数量
    const cnt = 4 - size(
        room.find(
            FIND_MY_CREEPS,
            { filter: { memory: { role: CREEP_ROLE_BASIC } }, }
        )
    );
    create_creep_by_room(room, cnt,
        ["work", "carry", "move"],
        CREEP_ROLE_BASIC + Date.now(),
        { memory: { role: CREEP_ROLE_BASIC }, }
    );
}

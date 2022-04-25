import { cacu_body_cost } from "@/modules/utils";

/**
 * 在指定的房间生成指定数量的定制 Creep
 * @param room 需要生成的房间
 * @param cnt 生成的数量
 * @param body Creep 的 Body
 * @param name Creep 的 Name
 * @param opts 其他的东西
 */
export function create_creep_by_room(room: Room, cnt: number, body: BodyPartConstant[], name: string, opts?: SpawnOptions) {
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
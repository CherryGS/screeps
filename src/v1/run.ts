import { run_basic } from "./basic";
import { CREEP_ROLE_BASIC } from "./const";
import { create_basic } from "./create_screep";

export function run() {
    // 清理已死亡 creeps 内存
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log("Clearing non-existing creep memory:", name);
        }
    }
    if (Game.gcl.level <= 2) {
        // gcl 过低时只考虑最基础的 Creep
        for (const room_hash in Game.rooms) {
            create_basic(Game.rooms[room_hash]);
        }
    }

    for (const creep_hash in Game.creeps) {
        const creep = Game.creeps[creep_hash];
        if (creep.memory.role === CREEP_ROLE_BASIC) {
            run_basic(creep);
        }
    }
}
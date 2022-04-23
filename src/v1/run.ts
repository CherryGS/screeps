import { run_basic } from "./role.basic";
import { CREEP_ROLE_BASIC } from "./const";
import { create_basic } from "./create_screep";
import { build_processor } from "./build";
import { print_cost_matrix as draw_cost_matrix } from "@/modules/utils";

export function run() {
    // 清理已死亡 creeps 内存
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log("Clearing non-existing creep memory:", name);
        }
    }

    // 为还没分配中心 spawn 的房间分配中心 spawn
    for (const room_hash in Game.rooms) {
        const room = Game.rooms[room_hash];
        if (room.memory.main_spawn === undefined) {
            room.memory.main_spawn = room.find(FIND_MY_SPAWNS)[0].name;
        }
    }

    // 对每个房间执行建筑进程
    for (const room_hash in Game.rooms) {
        build_processor(Game.rooms[room_hash]);
        const cost = PathFinder.CostMatrix.deserialize(Game.rooms[room_hash].memory.map);
        draw_cost_matrix(cost, Game.rooms[room_hash]);
    }

    // gcl 过低时只考虑最基础的 Creep
    if (Game.gcl.level <= 2) {
        for (const room_hash in Game.rooms) {
            create_basic(Game.rooms[room_hash]);
        }
    }

    // 运行 basic creep
    for (const creep_hash in Game.creeps) {
        const creep = Game.creeps[creep_hash];
        if (creep.memory.role === CREEP_ROLE_BASIC) {
            run_basic(creep);
        }
    }
}
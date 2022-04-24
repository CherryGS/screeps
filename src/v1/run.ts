import { run_basic } from "./role.basic";
import { CREEP_ROLE_BASIC } from "./const";
import { create_basic, create_harvester } from "./create_screep";
import { build_processor } from "./build";
import { draw_cost_matrix } from "@/modules/utils";
import { flag_command } from "./flag_command";
import { del_creep } from "./delete";
import { run as run_source } from "./source_manager";

export function run() {
    // 初始化
    // init_change();

    // 初始化旗语
    for (const room_hash in Game.rooms) {
        flag_command.run(Game.rooms[room_hash]);
    }

    // 清理已死亡 creeps 内存
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            del_creep(name);
            console.log("Clearing non-existing creep memory:", name);
        }
    }

    //初始化房间地图
    // for (const room_hash in Game.rooms) {
    //     init_matrix.run(Game.rooms[room_hash]);
    // }

    // 初始化房间资源管理
    for (const room_hash in Game.rooms) {
        const room = Game.rooms[room_hash];
        run_source(room);
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

    // 造 Creep
    for (const room_hash in Game.rooms) {
        create_harvester(Game.rooms[room_hash]);
        create_basic(Game.rooms[room_hash]);
    }

    // 运行 basic creep
    for (const creep_hash in Game.creeps) {
        const creep = Game.creeps[creep_hash];
        if (creep.memory.role === CREEP_ROLE_BASIC) {
            run_basic(creep);
        }
    }
}
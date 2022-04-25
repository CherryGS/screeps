import { draw_cost_matrix } from "@/modules/utils";
import { del_creep } from "./delete";
import { build_processor } from "./build";
import { flag_command } from "./flag_command";
import { run as run_source } from "./source_manager";
import { create_basic } from "./spawn/basicer";
import { create_builder } from "./spawn/builder";
import { create_carrier } from "./spawn/carrier";
import { create_harvester } from "./spawn/harvester";
import { run_basicer } from "./role/role.basicer";
import { run_carrier } from "./role/role.carrier";
import { run_builder } from "./role/role.builder";
import { run_harvester } from "./role/role.harvester";
import { CREEP_ROLE_BASIC, CREEP_ROLE_CARRYER, CREEP_ROLE_BUILDER, CREEP_ROLE_HARESTER } from "./const";

export function run() {
    // 初始化
    // init_change();

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

    // 初始化旗语
    for (const room_hash in Game.rooms) {
        flag_command.run(Game.rooms[room_hash]);
    }

    // 对每个房间执行建筑进程
    for (const room_hash in Game.rooms) {
        build_processor(Game.rooms[room_hash]);
        const cost = PathFinder.CostMatrix.deserialize(Game.rooms[room_hash].memory.map);
        draw_cost_matrix(cost, Game.rooms[room_hash]);
    }

    // 造 Creep
    for (const room_hash in Game.rooms) {
        const room = Game.rooms[room_hash];
        create_harvester(room);
        create_builder(room);
        create_carrier(room);
        create_basic(room);
    }
    // 运行 creep
    for (const creep_hash in Game.creeps) {
        const creep = Game.creeps[creep_hash];
        if (creep.spawning == true) { continue; }
        const r = creep.memory.role;
        if (r == CREEP_ROLE_BASIC) { run_basicer(creep); }
        else if (r == CREEP_ROLE_CARRYER) { run_carrier(creep); }
        else if (r == CREEP_ROLE_BUILDER) { run_builder(creep); }
        else if (r == CREEP_ROLE_HARESTER) { run_harvester(creep); }
    }
}
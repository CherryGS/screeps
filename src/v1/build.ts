import { lookAtAreaDo, movalbe } from "@/modules/utils";
import { filter, size } from "lodash";
import { EXTENSION_LEVEL_INFO, MAP_COST_STRUCTURE, MAP_COST_TERRIAN_BLOCK } from "./const";
import { map_search, update_road } from "./map";

/**
 * 建立基本的道路系统
 * @param room 
 */
function init_road(room: Room) {
    const spawn = Game.spawns[room.memory.main_spawn];
    const terrain = room.getTerrain();
    const all_target = new Array<{ pos: RoomPosition }>();
    all_target.push(...room.find(FIND_MY_STRUCTURES));
    all_target.push(...room.find(FIND_SOURCES));
    all_target.push(...room.find(FIND_MINERALS));
    // 如果中心 spawn 四周有没有被标记为道路的点 , 那么尝试从那个点朝所有有效建筑建立可行道路
    // 只会在草地上尝试
    let costs = PathFinder.CostMatrix.deserialize(room.memory.map);
    for (let i = -1; i <= 1; ++i) {
        for (let j = -1; j <= 1; ++j) {
            if (i == 0 && j == 0) { continue; }
            const x = spawn.pos.x + i;
            const y = spawn.pos.y + j;
            if (terrain.get(x, y) === 0) {
                if (costs.get(x, y) !== 1) {
                    for (const c of all_target) {
                        update_road(
                            new RoomPosition(x, y, room.name),
                            c.pos
                        );
                        // 地图被更新过了 , 更新当前使用的 maps
                        costs = PathFinder.CostMatrix.deserialize(room.memory.map);
                    }
                }
            }
        }
    }
}
export function build_processor(room: Room) {
    init_road(room);
    const costs = PathFinder.CostMatrix.deserialize(room.memory.map);
    // 建路
    for (let i = 0; i < 50; ++i) {
        for (let j = 0; j < 50; ++j) {
            if (costs.get(i, j) != 1) { continue; }
            // 如果一个地块有建筑或建筑工地就不尝试放置道路
            if (size(room.lookForAt(LOOK_STRUCTURES, i, j)) + size(room.lookForAt(LOOK_CONSTRUCTION_SITES, i, j)) == 0) {
                const res_code = room.createConstructionSite(i, j, STRUCTURE_ROAD);
                if (res_code !== OK) { console.log(`ERROR ${res_code} CAUSED WHEN CREATE CONSTRUCTIONSITE-ROAD`); }
            }
        }
    }

    // 在道路旁建 extension , 保证两个 extension 不相邻
    const sources = room.find(FIND_SOURCES);
    const target = sources[Game.time % sources.length];
    const spawn = Game.spawns[room.memory.main_spawn];
    const res = map_search(target.pos, spawn.pos);
    let cnt = EXTENSION_LEVEL_INFO[room.controller.level][0] -
        size(room.find(FIND_MY_STRUCTURES,
            { filter: { structureType: STRUCTURE_EXTENSION } })) -
        size(room.find(FIND_MY_CONSTRUCTION_SITES,
            { filter: { structureType: STRUCTURE_EXTENSION } }
        ));
    if (cnt > 0) { cnt = 1; }
    for (const c of res.path) {
        const i = c.x;
        const j = c.y;
        if (cnt <= 0) { break; }
        if (costs.get(i, j) == 1) {
            lookAtAreaDo(i - 1, i + 1, j - 1, j + 1, (x, y) => {
                if (cnt <= 0) { return; }
                if (x == i && y == j) { return; }
                if (costs.get(x, y) == 1
                    || costs.get(x, y) == MAP_COST_STRUCTURE
                    || costs.get(x, y) == MAP_COST_TERRIAN_BLOCK) { return; }
                if (room.lookForAt(LOOK_STRUCTURES, x, y).length != 0
                    || room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length != 0) { return; }
                let num = 0;
                lookAtAreaDo(x - 1, x + 1, y - 1, y + 1, (a, b) => {
                    if (Math.abs(x + y - a - b) > 1) { return; }
                    if (x == a && y == b) { return; }
                    // 这个点是否有无法走过的建筑
                    if (filter(room.lookForAt(LOOK_STRUCTURES, a, b), (o) => {
                        return !movalbe(o.structureType);
                    }).length) { num = num + 1; }
                    // 这个点是否有无法走过的工地
                    if (filter(room.lookForAt(LOOK_CONSTRUCTION_SITES, a, b), (o) => {
                        return !movalbe(o.structureType);
                    }).length) { num = num + 1; }
                });
                if (num === 0) {
                    const status_code = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
                    if (status_code !== OK) {
                        console.log(`buildprocess 中出现错误 , 发生在尝试建造 extension 时 , 错误原因 ${status_code} , 位置 (${x},${y})`);
                    }
                    else {
                        console.log("创建 建筑工地-Extension 成功");
                        --cnt;
                    }
                }
            });
        }
    }
}
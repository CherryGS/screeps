import { filter, size } from "lodash";
import { update_road } from "./map";

/**
 * 建立基本的道路系统
 * @param room 
 */
function pre_build(room: Room) {
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
    pre_build(room);
    const costs = PathFinder.CostMatrix.deserialize(room.memory.map);
    // 建路
    for (let i = 0; i < 50; ++i) {
        for (let j = 0; j < 50; ++j) {
            if (costs.get(i, j) != 1) { continue; }
            // 如果一个地块有建筑或建筑工地就不尝试放置道路
            if (size(room.lookForAt(LOOK_STRUCTURES, i, j)) == 0 && size(room.lookForAt(LOOK_CONSTRUCTION_SITES, i, j)) == 0) {
                const res_code = room.createConstructionSite(i, j, STRUCTURE_ROAD);
                if (res_code !== OK) { console.log(`ERROR ${res_code} CAUSED WHEN CREATE CONSTRUCTIONSITE-WALL`); }
            }
        }
    }
}
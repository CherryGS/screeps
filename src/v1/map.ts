import { MAP_COST_TERRIAN_GRASS, MAP_COST_TERRIAN_SWAMP, MAP_COST_TERRIAN_BLOCK } from "./const";

/**
 * 根据地形和已知道路格式化 CostMatrix , 方便使用
 * @param room 
 * @param matrix 
 */
function init_matrix(room: Room, matrix: CostMatrix) {
    const terrain = room.getTerrain();
    for (let i = 0; i < 50; ++i) {
        for (let j = 0; j < 50; ++j) {
            if (matrix.get(i, j) === 1) {
                // 此处是道路 , 不用走
                continue;
            }
            if (terrain.get(i, j) === TERRAIN_MASK_WALL) {
                // 墙视为不可通过
                matrix.set(i, j, MAP_COST_TERRIAN_BLOCK);
            }
            else if (terrain.get(i, j) === TERRAIN_MASK_SWAMP) {
                // 沼泽地分配权重 10
                matrix.set(i, j, MAP_COST_TERRIAN_SWAMP);
            }
            else {
                // 草地分配权重 4
                matrix.set(i, j, MAP_COST_TERRIAN_GRASS);
            }
        }
    }
}

const cost_matrix_cache = new Map<string, CostMatrix>();
/**
 * ! 高 CPU 消耗
 * 规划一条从起始点到终止点的修建道路的方案 , 基于已知道路
 * @param f 起始点的对象的 id
 * @param t 终止点的对象的 id
 */
export function update_road(f: RoomPosition, t: RoomPosition) {
    const res = PathFinder.search(f, { pos: t, range: 2 }, {
        roomCallback: (room_hash: string) => {
            // 没有定义的 room 直接返回 false
            const room = Game.rooms[room_hash];
            if (room === undefined) { return false; }
            // 如果全局有缓存 , 直接使用
            if (cost_matrix_cache[room_hash] !== undefined) { return cost_matrix_cache[room_hash]; }
            let room_map: CostMatrix;
            if (room.memory.map === undefined) {
                room_map = new PathFinder.CostMatrix;
                init_matrix(room, room_map);
                room.memory.map = room_map.serialize();
            }
            else { room_map = PathFinder.CostMatrix.deserialize(room.memory.map); }
            return room_map;
        }
    });
    // 将起点加入道路末尾 , 方便计算
    res.path.push(f);
    const tmp = new Map<string, CostMatrix>();
    // 将路径中的点断言作用来修道路的点
    for (const c of res.path) {
        if (tmp.get(c.roomName) === undefined) {
            tmp.set(c.roomName, PathFinder.CostMatrix.deserialize(Game.rooms[c.roomName].memory.map));
        }
        tmp.get(c.roomName).set(c.x, c.y, 1);
    }
    for (const c of tmp) {
        // 更新缓存
        cost_matrix_cache.set(c[0], c[1]);
        // 更新内存
        Game.rooms[c[0]].memory.map = c[1].serialize();
    }
}
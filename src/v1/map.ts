/**
 * 将 CostMatrix 初始化 , 方便使用
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
                matrix.set(i, j, 255);
            }
            else if (terrain.get(i, j) === TERRAIN_MASK_SWAMP) {
                // 沼泽地分配权重 10
                matrix.set(i, j, 10);
            }
            else {
                // 草地分配权重 4
                matrix.set(i, j, 4);
            }
        }
    }
}

/**
 * ! 高 CPU 消耗
 * 规划一条从起始点到终止点的修建道路的方案 , 基于已知道路
 * @param f 起始点的对象的 id
 * @param t 终止点的对象的 id
 */
let cost_matrix_cache: { [roomName: string]: CostMatrix };
export function update_road(f: RoomPosition, t: RoomPosition) {
    const res = PathFinder.search(f, { pos: t, range: 2 }, {
        roomCallback: (room_hash: string) => {
            // 如果全局有缓存 , 直接使用
            if (cost_matrix_cache[room_hash] !== undefined) { return cost_matrix_cache[room_hash]; }
            const room = Game.rooms[room_hash];
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
    let tmp: { [roomName: string]: CostMatrix };
    for (const c of res.path) {
        if (tmp[c.roomName] === undefined) {
            tmp[c.roomName] = PathFinder.CostMatrix.deserialize(Game.rooms[c.roomName].memory.map);
        }
        tmp[c.roomName].get(c.x, c.y);
    }
    for (const c in tmp) {
        // 更新缓存
        cost_matrix_cache[c] = tmp[c];
        // 更新内存
        Game.rooms[c].memory.map = tmp[c].serialize();
    }
}
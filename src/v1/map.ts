import { movalbe } from "@/modules/utils";
import { filter } from "lodash";
import { MAP_COST_TERRIAN_GRASS, MAP_COST_TERRIAN_SWAMP, MAP_COST_TERRIAN_BLOCK, MAP_COST_STRUCTURE } from "./const";

// 模块中的 CostMatrix 缓存 , 要保证及时更新
const cost_matrix_cache = new Map<string, CostMatrix>();

const cost_cache = {
    get(roomName: string): CostMatrix {
        if (cost_matrix_cache.get(roomName) === undefined) {
            cost_matrix_cache.set(
                roomName,
                PathFinder.CostMatrix.deserialize(Game.rooms[roomName].memory.map)
            );
        }
        return cost_matrix_cache.get(roomName);
    },
    set(key: string, value: CostMatrix) {
        return cost_matrix_cache.set(key, value);
    }
};

export function map_search(f: RoomPosition, t: RoomPosition, r = 2) {
    return PathFinder.search(f, { pos: t, range: r }, {
        roomCallback: (room_hash: string) => {
            // 没有定义的 room 直接返回 false
            const room = Game.rooms[room_hash];
            if (room === undefined) { return false; }
            // 如果没有地图就初始化一下
            if (room.memory.map === undefined) {
                init_matrix.run(room);
            }
            return PathFinder.CostMatrix.deserialize(room.memory.map);
        }
    });
}

export const init_matrix = {
    /**
     * 将不可走的建筑的位置设置对应的代价
     * @param room 
     */
    init_by_structure(room: Room) {
        const tmp = new Array<{ pos: RoomPosition, val: number }>();
        // 通过建筑物格式化 , 同时忽略可以经过的建筑
        const res = filter(
            room.find(FIND_STRUCTURES),
            (o) => {
                return !movalbe(o.structureType);
            }
        );

        // 根据建筑类型赋值
        for (const c of res) {
            tmp.push(
                { pos: c.pos, val: MAP_COST_STRUCTURE }
            );
        }
        set_cost_matrix(tmp);
    },

    /**
     * 只有为 0 的地方会被分配
     * @param room 
     */
    init_by_terrain(room: Room) {
        const matrix = cost_cache.get(room.name);
        const tmp = new Array<{ pos: RoomPosition, val: number }>();
        // 通过地形格式化
        const terrain = room.getTerrain();
        for (let i = 0; i < 50; ++i) {
            for (let j = 0; j < 50; ++j) {
                if (matrix.get(i, j) !== 0) {
                    // 此处已被后面分配 , 不用再分配地形
                    continue;
                }
                if (terrain.get(i, j) === TERRAIN_MASK_WALL) {
                    // 自然墙不可通过
                    tmp.push({
                        pos: new RoomPosition(i, j, room.name),
                        val: MAP_COST_TERRIAN_BLOCK
                    });
                }
                else if (terrain.get(i, j) === TERRAIN_MASK_SWAMP) {
                    // 沼泽地分配权重 10
                    tmp.push({
                        pos: new RoomPosition(i, j, room.name),
                        val: MAP_COST_TERRIAN_SWAMP
                    });
                }
                else {
                    // 草地分配权重 4
                    tmp.push({
                        pos: new RoomPosition(i, j, room.name),
                        val: MAP_COST_TERRIAN_GRASS
                    });
                }
            }
        }
        set_cost_matrix(tmp);
    },
    /**
     * ! 注意 , 未考虑工地
     * 根据建筑和地形为地图赋值
     * @param room 
     */
    run(room: Room) {
        this.init_by_structure(room);
        this.init_by_terrain(room);
    }
};

/**
 * ! 请不要手动修改 , 否则大概率因为缓存原因而使得修改失效
 * 用来修改指定房间的 Map
 * @param k 修改数组
 */
export function set_cost_matrix(k: Array<{ pos: RoomPosition, val: number }>) {
    // 存储修改过的房间名
    const name_set = new Set<string>();
    for (const c of k) {
        const pos = c.pos;
        const val = c.val;
        const costs = cost_cache.get(pos.roomName);
        costs.set(pos.x, pos.y, val);
        name_set.add(pos.roomName);
        // 更新缓存
        cost_cache.set(pos.roomName, costs);
    }
    // 更新内存
    for (const name of name_set) {
        Game.rooms[name].memory.map = cost_matrix_cache.get(name).serialize();
    }
}


/**
 * ! 高 CPU 消耗
 * 规划一条从起始点到终止点的修建道路的方案 , 基于已知道路
 * @param f 起始点的对象的 id
 * @param t 终止点的对象的 id
 */
export function update_road(f: RoomPosition, t: RoomPosition) {
    const res = map_search(f, t, 2);
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
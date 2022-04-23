import { update_road } from "./map";

function pre_build(room: Room) {
    const spawn = Game.spawns[room.memory.main_spawn];
    const terrain = room.getTerrain();
    const all_builds = room.find(FIND_MY_STRUCTURES) || room.find(FIND_SOURCES) || room.find(FIND_MINERALS);
    const costs = PathFinder.CostMatrix.deserialize(room.memory.map);

    // 如果中心 spawn 四周有没有被标记为道路的点 , 那么尝试从那个点朝所有有效建筑建立可行道路
    // 只会在草地上尝试
    for (let i = -1; i <= 1; ++i) {
        for (let j = -1; j <= 1; ++j) {
            const x = spawn.pos.x + i;
            const y = spawn.pos.y + j;
            if (terrain.get(x, y) === 0) {
                if (costs.get(x, y) !== 1) {
                    for (const c of all_builds) {
                        update_road(
                            RoomPosition(x, y, room.name),
                            c.pos
                        );
                    }
                }
            }
        }
    }
}
export function build_processor(room: Room) {
    pre_build(room);
}
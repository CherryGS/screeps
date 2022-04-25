import { init_matrix, update_road } from "./map";

// 清除图中所用工地
const f1 = {
    run(room: Room) {
        const f = room.lookForAt(LOOK_FLAGS, 0, 0);
        if (f.length === 0) {
            const res = room.find(FIND_MY_CONSTRUCTION_SITES);
            for (const c of res) { c.remove(); }
            console.log("旗语 : '清除所有工地'已触发");
        }
    },
    init(room: Room) {
        room.createFlag(0, 0, "移除所有建筑工地");
    }
};

// 刷新道路系统
const f2 = {
    run(room: Room) {
        const f = room.lookForAt(LOOK_FLAGS, 0, 1);
        if (f.length === 0) {
            const lis = new Array<{ pos: RoomPosition }>();
            init_matrix.run(room);
            lis.push(...room.find(FIND_MY_CONSTRUCTION_SITES));
            lis.push(...room.find(FIND_MY_STRUCTURES));
            for (const r1 of lis) {
                for (const r2 of lis) {
                    if (r1 != r2) {
                        update_road(r1.pos, r2.pos);
                    }
                }
            }
            console.log("旗语 : '更新道路'已触发");
        }
    },
    init(room: Room) {
        room.createFlag(0, 1, "根据建筑/工地更新道路规划");
    }
};

export const flag_command = {
    init(room: Room) {
        f1.init(room);
        f2.init(room);
    },
    run(room: Room) {
        f1.run(room);
        f1.init(room);
        f2.run(room);
        f2.init(room);
    }
};
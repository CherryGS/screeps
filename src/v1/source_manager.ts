import { eudis, lookAtAreaDo, passable } from "@/modules/utils";
import { memoize, sortBy } from "lodash";

const get_source_pc = memoize((source: Source) => {
    let sum = 0;
    lookAtAreaDo(
        source.pos.x - 1,
        source.pos.x + 1,
        source.pos.y - 1,
        source.pos.y + 1,
        (x, y) => {
            if (passable(new RoomPosition(x, y, source.room.name))) { ++sum; }
        }
    );
    return sum;
});

export const get_all_pc = memoize((room: Room) => {
    let sum = 0;
    const sources = room.find(FIND_SOURCES);
    for (const c of sources) { sum += get_source_pc(c); }
    return sum;
});

export function run(room: Room) {
    // 降低 Source 的 reserved 计数
    const sources = room.find(FIND_SOURCES);
    if (room.memory.sources === undefined) {
        room.memory.sources = {};
    }
    for (const c of sources) {
        // 初始化 sources 列表
        if (room.memory.sources[c.id] === undefined) {
            room.memory.sources[c.id] = {};
        }
        // 初始化 source 可用人员
        if (room.memory.sources[c.id].pc === undefined) {
            room.memory.sources[c.id].pc = get_source_pc(c);
        }
        if (room.memory.sources[c.id].cc === undefined) {
            room.memory.sources[c.id].cc = room.memory.sources[c.id].pc;
        }
        // 锁计数递降
        if (room.memory.sources[c.id].reserved > 0) {
            --room.memory.sources[c.id].reserved;
        }
        else { room.memory.sources[c.id].reserved = 0; }
    }
}



function own_source(id: string) {
    const source: Source = Game.getObjectById(id);
    --source.room.memory.sources[id].cc;
    if (source.room.memory.sources[id].cc < 0) {
        console.log("Source 分配出现异常!!!");
    }
}

/**
 * 找到距离给定点最近且未满的矿
 * 如果 lim 为 true , 则限制条件变为未被上锁的矿
 * @param pos 
 * @param lim
 * @returns 
 */
export function get_source(pos: RoomPosition, lim = true) {
    // 将 Source 按距离排序
    const sources = sortBy(
        Game.rooms[pos.roomName].find(
            FIND_SOURCES,
            {
                filter: (source) => {
                    return (source.room.memory.sources[source.id].cc > 0 || !lim)
                        && source.room.memory.sources[source.id].reserved == 0;
                }
            }
        ),
        (source) => { return eudis(source.pos, pos); }
    );
    if (sources.length > 0) {
        return sources[0].id;
    }
    else {
        return undefined;
    }
}

export function assign_source(pos: RoomPosition) {
    const id = get_source(pos);
    if (id !== undefined) { own_source(id); }
    return id;
}

export function release_source(memo: CreepMemory) {
    const source: Source = Game.getObjectById(memo.source);
    if (source === null) { return; }
    const num = source.room.memory.sources[source.id].cc;
    source.room.memory.sources[source.id].cc = num + 1;
}
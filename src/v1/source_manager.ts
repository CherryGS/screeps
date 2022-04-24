import { eudis, lookAtAreaDo } from "@/modules/utils";
import { sortBy } from "lodash";

export const source_manager = {
    get_source_pc(source: Source) {
        let sum = 0;
        const terrain = source.room.getTerrain();
        lookAtAreaDo(
            source.pos.x - 1,
            source.pos.x + 1,
            source.pos.y - 1,
            source.pos.y + 1,
            (x, y) => {
                if (terrain.get(x, y) == TERRAIN_MASK_SWAMP || terrain.get(x, y) == 0) { ++sum; }
            }
        );
        return sum;
    },
    get_all_pc(room: Room) {
        let sum = 0;
        const sources = room.find(FIND_SOURCES);
        for (const c of sources) { sum += this.get_source_pc(c); }
        return sum;
    },
    init_by_room(room: Room) {
        const sources = room.find(FIND_SOURCES);
        for (const source of sources) {
            if (room.memory.sources[source.id] === undefined) {
                room.memory.sources[source.id] = {};
            }
            if (room.memory.sources[source.id].pc === undefined) {
                room.memory.sources[source.id].pc = this.get_source_pc(source);
            }
        }
    },
    release_source(id: string) {
        const source: Source = Game.getObjectById(id);
        const num = source.room.memory.sources[source.id].nn;
        if (num <= 0) {
            console.log(`Source ${source.id} 已被使用的数量为 0 时却发起了释放`);
            return;
        }
        else {
            source.room.memory.sources[source.id].nn = num - 1;
        }
    },
    /**
     * 分配距离给定点最近且未满的矿
     * @param pos 
     * @returns 
     */
    assign_source(pos: RoomPosition) {
        // 将 Source 按距离排序
        const sources = sortBy(
            Game.rooms[pos.roomName].find(
                FIND_SOURCES,
                { filter: (source) => { return source.room.memory.sources[source.id].nn > 0; } }
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
};
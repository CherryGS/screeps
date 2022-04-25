import { memoize, random } from "lodash";

export function lookAtAreaDo(
    left_x: number,
    right_x: number,
    top_y: number,
    bottom_y: number,
    _do: (x: number, y: number) => unknown,
) {
    for (let i = left_x; i <= right_x; ++i) {
        for (let j = top_y; j <= bottom_y; ++j) {
            if (_do(i, j) === true) { return; }
        }
    }
}

/**
 * 通过 body 计算该 Creep 的生成花费
 */
export const cacu_body_cost = memoize((body: BodyPartConstant[]) => {
    let sum = 0;
    for (const c of body) {
        if (c === "move") { sum += 50; }
        else if (c === "work") { sum += 100; }
        else if (c === "carry") { sum += 50; }
        else if (c === "attack") { sum += 80; }
        else if (c === "ranged_attack") { sum += 150; }
        else if (c === "heal") { sum += 250; }
        else if (c === "claim") { sum += 600; }
        else if (c === "tough") { sum += 10; }
    }
    return sum;
}
);

/**
 * 根据房间矩阵把权值会绘制到 UI 上
 * @param cost 
 * @param room 
 */
export function draw_cost_matrix(cost: CostMatrix, room: Room) {
    for (let i = 0; i < 50; ++i) {
        for (let j = 0; j < 50; ++j) {
            const r = cost.get(i, j);
            room.visual.text(String(r), i, j, { font: 0.3 });
        }
    }
}

export function eudis(pos1: RoomPosition | { x: number, y: number }, pos2: RoomPosition | { x: number, y: number }) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * 判断 Structure 的类型是否是允许 Creep 在上面移动的
 * @param s 
 * @returns 
 */
export function movalbe(s: string) {
    return s === STRUCTURE_RAMPART || s === STRUCTURE_ROAD || s === STRUCTURE_CONTAINER;
}

/**
 * 判断一个点是否可以站到上面
 * @param pos 
 * @returns 
 */
export const passable = (pos: RoomPosition) => {
    const room = Game.rooms[pos.roomName];
    const res = room.lookAt(pos);
    for (const c of res) {
        if (c.terrain != undefined && c.terrain == "wall") { return false; }
        if (c.structure != undefined && !movalbe(c.structure.structureType)) { return false; }
        if (c.constructionSite != undefined && !movalbe(c.constructionSite.structureType)) { return false; }
    }
    return true;
};

export function is_cleaning(pos: RoomPosition) {
    const room = Game.rooms[pos.roomName];
    return room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y).length == 0
        && room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y).length == 0;
}

/**
 * 删除某个点的工地和建筑 , 除了 rampart
 * @param pos 
 */
export function remove_loc(pos: RoomPosition) {
    const room = Game.rooms[pos.roomName];
    for (const c of room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y)) {
        if (c.structureType != STRUCTURE_RAMPART) {
            console.log(`摧毁了建筑 ${c.structureType} 在 (${pos.x},${pos.y})`);
            c.destroy();
        }
    }
    for (const c of room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y)) {
        if (c.structureType != STRUCTURE_RAMPART) {
            console.log(`取消了工地 ${c.structureType} 在 (${pos.x},${pos.y})`);
            c.remove();
        }
    }
}

const lis = [TOP_LEFT, TOP, TOP_RIGHT,
    LEFT, -1, RIGHT,
    BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT];
export function random_move(creep: Creep) {
    let r;
    while (r != -1) {
        r = random(0, 8);
        if (r != 3 && creep.move(r) == OK) { break; }
    }
}
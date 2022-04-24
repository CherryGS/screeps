import { memoize } from "lodash";

export function lookAtAreaDo(
    top: number,
    bottom: number,
    left: number,
    right: number,
    _do: (x: number, y: number) => unknown,
) {
    for (let i = top; i <= bottom; ++i) {
        for (let j = left; j <= right; ++j) {
            _do(i, j);
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

export function movalbe(s: string) {
    return s === STRUCTURE_RAMPART || s === STRUCTURE_ROAD || s === STRUCTURE_CONTAINER;
}

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
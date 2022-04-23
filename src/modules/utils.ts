import { MAP_COST_STRUCTURE_SPAWN } from "@/v1/const";
import { memoize } from "lodash";

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

export function print_cost_matrix(cost: CostMatrix, room: Room) {
    for (let i = 0; i < 50; ++i) {
        for (let j = 0; j < 50; ++j) {
            const r = cost.get(i, j);
            if (r < 255) { room.visual.text(String(r), i, j); }
            else if (r === MAP_COST_STRUCTURE_SPAWN) {
                room.visual.text("S", i, j, { font: 0.1 });
            }
        }
    }
}

export function eudis(pos1: RoomPosition | { x: number, y: number }, pos2: RoomPosition | { x: number, y: number }) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

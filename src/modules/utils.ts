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
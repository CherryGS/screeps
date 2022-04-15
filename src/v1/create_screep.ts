import { size } from "lodash";
import { CREEP_ROLE_MINER, CREEP_STATUS_HARVEST } from "./const";

export function create_miner(room: Room) {
    let cnt = size(room.find(FIND_MY_CREEPS, { filter: { memory: { role: CREEP_ROLE_MINER } } }));
    console.log(`Now have ${cnt} harvesters`);
    for (let spawn of room.find(FIND_MY_SPAWNS)) {
        if (cnt > 3) { break; }
        let new_creep = spawn.spawning;
        if (new_creep === null) {
            let status_code = spawn.spawnCreep(
                ['work', 'carry', 'carry', 'move'],
                CREEP_ROLE_MINER + Date.now(),
                { memory: { role: CREEP_ROLE_MINER, status: CREEP_STATUS_HARVEST } }
            );
            if (status_code == OK) {
                ++cnt;
                let spawningCreep = Game.creeps[spawn.spawning.name];
                room.visual.text('🛠️' + spawningCreep.memory.role, spawn.pos.x, spawn.pos.y);
            }
            else { console.log(`ERROR ${status_code} CAUSED WHEN ${spawn.name} SPAWNING. `); }
        }
    }
}
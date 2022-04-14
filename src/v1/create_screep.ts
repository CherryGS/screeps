import { CREEP_ROLE_MINER } from "./const";

export function create_miner(room: Room) {
    let cnt = 0;
    for (let creep of room.find(FIND_CREEPS)) {
        if (creep.memory.role === CREEP_ROLE_MINER) { ++cnt; }
    }
    for (let spawn of room.find(FIND_MY_SPAWNS)) {
        if (cnt > 3) { break; }
        let new_creep = spawn.spawning;
        if (new_creep === null) {
            spawn.spawnCreep(['work', 'work', 'carry', 'move'], CREEP_ROLE_MINER + Date.now())
            ++cnt;
        }
    }
}
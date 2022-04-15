export function create_miner(room: Room) {
    let cnt = 0;
    for (let creep of room.find(FIND_CREEPS)) {
        if (creep.memory.role === CREEP_ROLE_MINER) { ++cnt; }
    }
    for (let spawn of room.find(FIND_MY_SPAWNS)) {
        if (cnt > 3) { break; }
        let new_creep = spawn.spawning;
        if (new_creep === null) {
            let status_code = spawn.spawnCreep(
                ['work', 'work', 'carry', 'move'],
                CREEP_ROLE_MINER + Date.now(),
                { memory: { role: CREEP_ROLE_MINER } }
            );
            if (status_code == OK) { ++cnt; }
            else { console.log(`ERROR ${status_code} CAUSED WHEN ${spawn.name} SPAWNING. `); }
        }
    }
}
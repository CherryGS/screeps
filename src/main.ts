import { errorMapper } from './modules/errorMapper'
import { create_miner } from './v1/create_screep';
import { work_source } from './v1/miner';

export const loop = errorMapper(() => {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    let creeps = Game.creeps;
    let rooms = Game.rooms;
    for (let i in rooms) {
        create_miner(rooms[i]);
    }
    for (let i in creeps) {
        work_source(creeps[i]);
    }
})
import { errorMapper } from './modules/errorMapper'
import { create_miner } from './v1/create_screep';
import { work_source } from './v1/miner';

export const loop = errorMapper(() => {
    let creeps = Game.creeps;
    let rooms = Game.rooms;
    for (let i in rooms) {
        create_miner(rooms[i]);
    }
    for (let i in creeps) {
        work_source(creeps[i]);
    }
})
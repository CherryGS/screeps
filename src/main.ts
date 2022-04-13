import { errorMapper } from './modules/errorMapper'

export const loop = errorMapper(() => {
    for (let i in Game.rooms) {
        let room = Game.rooms[i];

    }
})
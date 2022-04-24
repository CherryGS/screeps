export const flag_command = {
    // 清除图中所用工地
    f1: {
        run(room: Room) {
            const f = room.lookForAt(LOOK_FLAGS, 0, 0);
            if (f.length === 0) {
                const res = room.find(FIND_MY_CONSTRUCTION_SITES);
                for (const c of res) { c.remove(); }
                this.init(room);
                console.log("旗语 : '清除所有工地'已触发");
            }
        },
        init(room: Room) {
            room.createFlag(0, 0, "remove all constructionsites");
        }
    },
    init(room: Room) {
        this.f1.init(room);
    },
    run(room: Room) {
        this.f1.run(room);
    }
};
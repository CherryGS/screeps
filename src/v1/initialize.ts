export function init_change() {
    // 修改 harvest
    if (Creep.prototype._harvest === undefined) {
        Creep.prototype._harvest = Creep.prototype.harvest;
        Creep.prototype.harvest = (target) => {
            return Creep.prototype._harvest(target);
        };
    }
}
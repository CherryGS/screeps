interface CreepMemory {
    /**
     * Creep 的角色
     */
    role?: string;

    /**
     * Mineral 的 id
     */
    source?: Id<Source>;

    /**
     *  creep 当前工作状态
     */
    status?: string;
}

interface Creep {
    memory: CreepMemory;
}
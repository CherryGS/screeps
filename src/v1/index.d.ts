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

    /**
     *  creep 当前目标 id , 注意及时清空
     */
    target?: string;
}

interface Creep {
    memory: CreepMemory;
}
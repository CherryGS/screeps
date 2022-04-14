interface CreepMemory {
    /**
     * Creep 的角色
     */
    role?: string;

    /**
     * Mineral 的 id
     */
    source?: Id<Source>;
}

interface Creep {
    memory: CreepMemory;
}
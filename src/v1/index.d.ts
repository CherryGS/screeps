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

interface RoomMemory {
    /**
     * CostMatrix 矩阵的压缩形式 , 用来储存道路信息
     */
    map?: number[];

    /**
     * 该房间中心 spawn 的名字
     */
    main_spawn?: string;
}
interface SourceMemory {
    /**
     * 人员容量
     */
    pc?: number;

    /**
     * 当前还有多少人可用
     */
    cc?: number;

    /**
     * 是否被预定为挖运分离的矿 , 有三个阶段
     * 0 : 当前无人预订
     * 1 : 持续中 , 即将取消预订
     * 2 : 刚被预定过
     */
    reserved?: number;
}

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

    /**
     * 存储该房间的 Source 和其相关信息
     */
    sources?: { [sourceId: string]: SourceMemory };
}

interface Creep {
    _harvest(target: Source | Mineral | Deposit): CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES;
}
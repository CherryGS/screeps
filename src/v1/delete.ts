import { source_manager } from "./source_manager";
export function del_creep(name: string) {
    // 删除其对 Source 的占用
    source_manager.release_source(Memory.creeps[name].source);
    // 删除剩余部分
    delete Memory.creeps[name];
}
import { release_source } from "./source_manager";

export function del_creep(name: string) {
    // 删除其对 Source 的占用
    release_source(Memory.creeps[name]);
    // 删除剩余部分
    delete Memory.creeps[name];
}
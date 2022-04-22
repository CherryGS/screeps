import { errorMapper } from "./modules/errorMapper";
import { run } from "./v1/run";

export const loop = errorMapper(() => {
    run();
});
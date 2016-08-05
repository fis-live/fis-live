import { Racer } from "./racer";

export class StartListEntry {
    constructor(
        public order: number,
        public status: string,
        public racer: Racer
    ) { }
}
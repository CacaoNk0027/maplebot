"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InteractionData {
    id;
    unique;
    constructor() {
        this.id = null;
        this.unique = false;
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setUnique() {
        this.unique = true;
        return this;
    }
}
exports.default = InteractionData;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gifCategories = gifCategories;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Categorías de un catálogo de GIFs: las propiedades del schema que son listas
 * de subdocumentos. El API las usa como lista blanca, así que agregar la
 * propiedad al schema basta para servir la categoría.
 */
function gifCategories(schema) {
    const categories = new Set();
    schema.eachPath((path, type) => {
        if (type instanceof mongoose_1.default.Schema.Types.DocumentArray)
            categories.add(path);
    });
    return categories;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_RULE = exports.USERNAME_RULE = void 0;
exports.isValidUsername = isValidUsername;
exports.isValidPassword = isValidPassword;
const USERNAME = /^[A-Za-z0-9_-]{1,30}$/;
// bcrypt solo usa los primeros 72 bytes: lo que pase de ahí se ignoraría sin avisar.
const PASSWORD_MAX_BYTES = 72;
exports.USERNAME_RULE = 'El nombre de usuario solo puede tener letras, números, guiones y guiones bajos, hasta 30 caracteres.';
exports.PASSWORD_RULE = 'La contraseña debe tener de 8 a 72 caracteres, con al menos una letra, un número y un símbolo.';
function isValidUsername(username) {
    return typeof username === 'string' && USERNAME.test(username);
}
/** Cualquier carácter que no sea letra ni número cuenta como símbolo. */
function isValidPassword(password) {
    return typeof password === 'string'
        && password.length >= 8
        && Buffer.byteLength(password, 'utf8') <= PASSWORD_MAX_BYTES
        && /[A-Za-z]/.test(password)
        && /\d/.test(password)
        && /[^A-Za-z0-9]/.test(password);
}

'use strict';
/**
 * @param {String} prefix 
 */
module.exports = function ftc(prefix) {
return `\`\`\`
${prefix}accept    ${prefix}addrol    ${prefix}ban    ${prefix}blacklist
${prefix}decline   ${prefix}kick      ${prefix}lock   ${prefix}mute
${prefix}purge     ${prefix}removerol ${prefix}unban  ${prefix}unlock
${prefix}unmute    ${prefix}unwarn    ${prefix}warn   ${prefix}warns
${prefix}timeout   ${prefix}ratelimit 
\`\`\``
}
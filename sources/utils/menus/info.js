'use strict';
/**
 * @param {String} prefix 
 */
module.exports = function info(prefix) {
return `\`\`\`
${prefix}botinfo   ${prefix}infoemoji   ${prefix}help
${prefix}ping      ${prefix}prefix      ${prefix}serverinfo  
${prefix}stats     ${prefix}userinfo
\`\`\``
}
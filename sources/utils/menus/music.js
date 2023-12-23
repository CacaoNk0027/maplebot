'use strict';
/**
 * @param {String} prefix 
 */
module.exports = function music(prefix) {
return `\`\`\`
${prefix}pause   ${prefix}play   ${prefix}queue   ${prefix}resume
${prefix}shuffle ${prefix}skip   ${prefix}stop

(psst quizas haya mas comandos para un futuro ¬w¬)
\`\`\``
}
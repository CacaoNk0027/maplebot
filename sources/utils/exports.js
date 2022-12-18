const configs = require('./assets/configs.json')

exports.presences = async (client) => {
    var json_string = JSON.stringify(configs.presences);
    json_string.replace('$developer', (await client.application?.fetch()).owner.username);
    json_string.replace('$guilds', (client.guilds.cache.size))
    json_string.replace('$commands', client.comandos.size)
    return JSON.parse(json_string)
};

exports.blacklist = configs.blacklist;
exports.permissions = configs.permissions;

exports._random = (array) => array[Math.floor(Math.random()*array.length)];
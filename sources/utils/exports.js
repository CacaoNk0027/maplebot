const configs = require('./assets/configs.json')

let defaultOptions = configs.menu_options

let one_ = {
    "label": "Nsfw",
    "emoji": "853975964123398144",
    "description": "comandos solo para nsfw",
    "value": "11"
}
let two_ = {
    "label": "Rolplay Nsfw",
    "emoji": "869814289727381575",
    "description": "comandos para rolplay nsfw",
    "value": "12"
}

exports.presences = async (client) => {
    var json_string = JSON.stringify(configs.presences);
    json_string.replace('$developer', (await client.application?.fetch()).owner.username);
    json_string.replace('$guilds', (client.guilds.cache.size))
    json_string.replace('$commands', client.comandos.size)
    return JSON.parse(json_string)
};

exports.blacklist = configs.blacklist;
exports.permissions = configs.permissions;

exports.menuOptions = (channel) => {
    if (!channel.nsfw) return defaultOptions; else {
        defaultOptions.push(one_);
        defaultOptions.push(two_);
        return defaultOptions;
    }
}
exports._random = (array) => array[Math.floor(Math.random()*array.length)];
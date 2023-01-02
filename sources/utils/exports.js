const configs = require('./assets/configs.json')
const { colors } = require('./assets/colors');
const { Guild, ButtonInteraction } = require('discord.js');

let defaultOptions = configs.menu_options
let guildDefaultOptions = configs.guild_options

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
let g_one_ = {
    "label": "Comunidad",
    "emoji": "888230718780633108",
    "description": "Infomacion sobre el servidor ( Comunidad )",
    "value": "3"
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

exports.interactionErrorMsg = async (interaction, error) => {
    console.error(error)
    await interaction.channel.send({
        content: `> oh no!.. ha ocurrido un error.. <:002:1012749017798688878>\n\`${error}\`\npuedes reportar el error usando mi comando /report o puedes unirte al servidor de soporte y reportarlo ahi\nhttps://discord.gg/PKGhvUKaQN`,
    });
}

/**
 * @param {ButtonInteraction} interaction
 * @returns {Promise<boolean>}
 */
exports._buttonFilter = async (interaction) => {
    let message = (await interaction.channel.messages.fetch(interaction.message.reference.messageId))
    if(interaction.user.id !== message.author.id) return false; else true;
}

exports._random = (array) => array[Math.floor(Math.random() * array.length)];

exports.randomColor = this._random(colors)

/**
 * 
 * @param {Guild} guild 
 */
exports.guildMenuOptions = (guild) => {
    if(!guild.features.includes('COMMUNITY')) return guildDefaultOptions; else {
        guildDefaultOptions.push(g_one_);
        return guildDefaultOptions;
    }
}
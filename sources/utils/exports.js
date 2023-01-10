const configs = require('./assets/configs.json')
const Canvas = require('canvas')
const { colors } = require('./assets/colors');
const { Guild, ButtonInteraction, Message, AttachmentBuilder, Collection } = require('discord.js');

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
    if (interaction.user.id !== message.author.id) return false; else true;
}

exports._random = (array) => array[Math.floor(Math.random() * array.length)];

exports.randomColor = () => this._random(colors)

/**
 * @param {{ id?: string, message: Message, args?: import('../../typings').args}} options 
 */
exports.fetchUser = async (options) => {
    let user;
    const { args, id, message } = options
    if (!id && message && args) {
        if (args.length >= 1) {
            try {
                user = await message.client.users.fetch(args[0].match(/\d{18}/g)[0])
            } catch (error) {
                user = await message.author.fetch()
            }
            let verify = user;
            return {
                user,
                userIsAuthor() {
                    return verify.id === message.author.id;
                }
            };
        }
        if (message.mentions.users.size >= 1) {
            try {
                user = (await message.mentions.users.first().fetch())
            } catch (error) {
                user = await message.author.fetch()
            }
            let verify = user;
            return {
                user,
                userIsAuthor() {
                    return verify.id === message.author.id;
                }
            };
        }
        user = await message.author.fetch();
        return {
            user,
            userIsAuthor() {
                return true;
            }
        };
    }
    if (id && message && !args) {
        try {
            user = await message.client.users.fetch(id)
        } catch (error) {
            user = await message.author.fetch()
        }
        let verify = user;
        return {
            user,
            userIsAuthor() {
                return verify.id === message.author.id;
            }
        };
    }
    user = await message.author.fetch();
    return {
        user,
        userIsAuthor() {
            return true;
        }
    };
}

/**
 * @param {{ id?: string, message?: Message, args?: import('../../typings').args}} options 
 */
exports.fetchMember = async (options) => {
    let member
    const { args, id, message } = options
    if (!id && message && args) {
        if (args.length >= 1) {
            try {
                member = await message.guild.members.fetch(args[0].match(/\d{18}/g)[0])
            } catch (error) {
                member = null
            }
            let verify = member;
            return {
                member,
                memberIsAuthor() {
                    return verify.id === message.member.id;
                }
            };
        }
        if (message.mentions.members.size >= 1) {
            try {
                member = (await message.mentions.members.first().fetch())
            } catch (error) {
                member = null
            }
            let verify = member;
            return {
                member,
                memberIsAuthor() {
                    return verify.id === message.member.id;
                }
            };
        }
        member = await message.member.fetch();
        return {
            member,
            memberIsAuthor() {
                return true;
            }
        }
    }
    if (id && message && !args) {
        try {
            member = await message.guild.members.fetch(id)
        } catch (error) {
            member = null
        }
        let verify = member;
        return {
            member,
            memberIsAuthor() {
                return verify.id === message.member.id;
            }
        };
    }
    member = await message.member.fetch();
    return {
        member,
        memberIsAuthor() {
            return true;
        }
    }

}
/**
 * @param {Guild} guild 
 */
exports.guildMenuOptions = (guild) => {
    if (!guild.features.includes('COMMUNITY')) return guildDefaultOptions; else {
        guildDefaultOptions.push(g_one_);
        return guildDefaultOptions;
    }
}

exports.newColorImage = async (hexColor) => {
    if (hexColor == null) return {
        embedUrl: null,
        attachment: null
    };
    let canvas = Canvas.createCanvas(500, 50)
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = hexColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `20px "Honey"`
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.fillText(hexColor, canvas.width / 2.0, canvas.height / 1.5)

    return {
        embedUrl: `attachment://newcolor_${hexColor.toLowerCase().substring(1)}.png`,
        attachment: new AttachmentBuilder().setFile(canvas.toBuffer()).setDescription(`Color hexadecimal ${hexColor.toLowerCase()}`).setName(`newcolor_${hexColor.toLowerCase().substring(1)}.png`),
    }
}

exports.createCollections = (client) => {
    client.comandos = new Collection();
    client.slashCommands = new Collection();
    client.buttons = new Collection();
    client.avatars = new Collection();
    client.channels_pages = new Collection();
}
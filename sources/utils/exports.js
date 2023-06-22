const configs = require('./assets/configs.json')
const Canvas = require('canvas')
const { colors } = require('./assets/colors');
const { Guild, ButtonInteraction, Message, AttachmentBuilder, Collection, CommandInteraction, GuildMember } = require('discord.js');

let defaultOptions = configs.menu_options
let guildDefaultOptions = configs.guild_options
let optionsWnsfw = configs.menu_options_wnsfw
let commGuildOptions = configs.guild_options_wcomm

exports.presences = async (client) => {
    var json_string = JSON.stringify(configs.presences).replace('$developer', (await client.application?.fetch()).owner.username).replace('$guilds', (client.guilds.cache.size)).replace('$commands', client.comandos.size)
    return JSON.parse(json_string)
};

exports.blacklist = configs.blacklist;
exports.permissions = configs.permissions;

exports.menuOptions = (channel) => {
    return channel.nsfw ? optionsWnsfw: defaultOptions;
}
/**
 * @param {Guild} guild 
 */
exports.guildMenuOptions = (guild) => {
    return guild.features.includes('COMMUNITY') ? commGuildOptions: guildDefaultOptions;
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
    try {
        let message = (await interaction.channel.messages.fetch(interaction.message.reference.messageId))
        if (interaction.user.id !== message.author.id) return false; else true;
    } catch (error) {
        if (interaction.user.id !== interaction.message.interaction.user.id) return false; else true;
    }
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
        if (args.length >= 1) {
            try {
                user = await (await message.client.users.fetch(args[0].match(/\d{19}|\d{18}/g)[0])).fetch()
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
                member = await (await message.guild.members.fetch(args[0].match(/\d{19}|\d{18}/g)[0])).fetch()
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
 * 
 * @param {{ id?: string, message?: Message, args?: import('../../typings').args}} options 
 */
exports.fetchChannel = async (options) => {
    let channel;
    const { args, id, message } = options
    if (!id && message && args) {
        if (args.length >= 1) {
            try {
                channel = await (await message.guild.channels.fetch(args[0].match(/\d{19}|\d{18}/g)[0])).fetch()
            } catch (error) {
                channel = null
            }
            let verify = channel;
            return {
                channel,
                channelIsCurrent() {
                    return verify.id === message.channel.id
                }
            }
        }
        if (message.mentions.channels.size >= 1) {
            try {
                channel = (await message.mentions.channels.first().fetch())
            } catch (error) {
                channel = null
            }
            let verify = channel;
            return {
                channel,
                channelIsCurrent() {
                    return verify.id === message.channel.id;
                }
            }
        }
        channel = await message.channel.fetch();
        return {
            channel,
            channelIsCurrent() {
                return true;
            }
        }
    }
    if (id && message && !args) {
        try {
            channel = await message.guild.channels.fetch(id)
        } catch (error) {
            channel = null;
        }
        let verify = channel;
        return {
            channel,
            channelIsCurrent() {
                return verify.id === message.channel.id
            }
        }
    }
    channel = await message.channel.fetch()
    return {
        channel,
        channelIsCurrent() {
            return true;
        }
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
    client.chroles_pages = new Collection();
    client.roles_pages = new Collection();
}

let fontPath = (file) => `sources/utils/assets/fonts/${file}`

exports.fonts = () => {
    Canvas.registerFont(fontPath('honey.otf'), { family: 'Honey' })
    Canvas.registerFont(fontPath('violet_smile.otf'), { family: 'Violet Smile' })
    Canvas.registerFont(fontPath('arial.ttf'), { family: 'Arial' })
    Canvas.registerFont(fontPath('product_sans_regular.ttf'), { family: 'Product Sans Regular' })
    Canvas.registerFont(fontPath('roboto_regular.ttf'), { family: 'Roboto Regular' })
    Canvas.registerFont(fontPath('minecraft.ttf'), { family: 'FontCraft' })
}

/**
 * @param {CommandInteraction} interaction 
 * @param {string} text 
 */
exports.replaces_msg_i = (interaction, text) => {
    if (text == null) return null;
    let cadena = text;
    if (cadena.match(/{guild}|{Guild}|{GUILD}/g)) {
        cadena = cadena.replace(/{guild}|{Guild}|{GUILD}/g, interaction.guild.name)
    }
    if (cadena.match(/{user}|{User}|{USER}/g)) {
        cadena = cadena.replace(/{user}|{User}|{USER}/g, interaction.user.username)
    }
    if (cadena.match(/{usertag}|{Usertag}|{UserTag}|{userTag}|{USERTAG}/g)) {
        cadena = cadena.replace(/{usertag}|{Usertag}|{UserTag}|{userTag}|{USERTAG}/g, interaction.user.tag)
    }
    if (cadena.match(/{number}|{Number}|{NUMBER}/g)) {
        cadena = cadena.replace(/{number}|{Number}|{NUMBER}/g, interaction.guild.memberCount)
    }
    if (cadena.match(/{mention}|{Mention}|{MENTION}/g)) {
        cadena = cadena.replace(/{mention}|{Mention}|{MENTION}/g, `<@${interaction.user.id}>`)
    }
    return cadena
}

/**
 * @param {Message} message 
 * @param {string} text 
 */
exports.replaces_msg_m = (message, text) => {
    let cadena = text;
    if (cadena.match(/{guild}|{Guild}|{GUILD}/g)) {
        cadena = cadena.replace(/{guild}|{Guild}|{GUILD}/g, message.guild.name)
    }
    if (cadena.match(/{user}|{User}|{USER}/g)) {
        cadena = cadena.replace(/{user}|{User}|{USER}/g, message.author.username)
    }
    if (cadena.match(/{usertag}|{Usertag}|{UserTag}|{userTag}|{USERTAG}/g)) {
        cadena = cadena.replace(/{usertag}|{Usertag}|{UserTag}|{userTag}|{USERTAG}/g, message.author.tag)
    }
    if (cadena.match(/{number}|{Number}|{NUMBER}/g)) {
        cadena = cadena.replace(/{number}|{Number}|{NUMBER}/g, message.guild.memberCount)
    }
    if (cadena.match(/{mention}|{Mention}|{MENTION}/g)) {
        cadena = cadena.replace(/{mention}|{Mention}|{MENTION}/g, `<@${message.author.id}>`)
    }
    return cadena
}

exports.parseJson = (welcome) => {
    if (!welcome) return null
    return {
        type: welcome.type ? welcome.type : "image",
        message: welcome.message,
        description: welcome.description ? welcome.description : "pasala bien en {guild}",
        title: welcome.title ? welcome.title : "Bienvenido/a {user}!",
        colors: {
            title: welcome.color.title ? welcome.color.title : "#FFFFFF",
            description: welcome.color.description ? welcome.color.description : "#FFFFFF",
            avatar: welcome.color.avatar ? welcome.color.avatar : "#FFFFFF"
        },
        background: {
            type: welcome.background.tipo ? welcome.background.tipo : "color",
            data: welcome.background.data ? welcome.background.data : "#23272A"
        }
    }
}
exports.farewellJson = (farewell) => {
    if (!farewell) return null
    return {
        type: farewell.type ? farewell.type : "image",
        message: farewell.message,
        description: farewell.description ? farewell.description : "Esperamos verte pronto,,,",
        title: farewell.title ? farewell.title : "Adios {user}",
        colors: {
            title: farewell.color.title ? farewell.color.title : "#FFFFFF",
            description: farewell.color.description ? farewell.color.description : "#FFFFFF",
            avatar: farewell.color.avatar ? farewell.color.avatar : "#FFFFFF"
        },
        background: {
            type: farewell.background.tipo ? farewell.background.tipo : "color",
            data: farewell.background.data ? farewell.background.data : "#23272A"
        }
    }
}

/**
 * @param {GuildMember} member 
 * @param {string} text 
 */
exports.replaces_msg_g = (member, text) => {
    let cadena = text;
    if (cadena.match(/{guild}|{Guild}|{GUILD}/g)) {
        cadena = cadena.replace(/{guild}|{Guild}|{GUILD}/g, member.guild.name)
    }
    if (cadena.match(/{user}|{User}|{USER}/g)) {
        cadena = cadena.replace(/{user}|{User}|{USER}/g, member.user.username)
    }
    if (cadena.match(/{usertag}|{Usertag}|{UserTag}|{userTag}|{USERTAG}/g)) {
        cadena = cadena.replace(/{usertag}|{Usertag}|{UserTag}|{userTag}|{USERTAG}/g, member.user.tag)
    }
    if (cadena.match(/{number}|{Number}|{NUMBER}/g)) {
        cadena = cadena.replace(/{number}|{Number}|{NUMBER}/g, member.guild.memberCount)
    }
    if (cadena.match(/{mention}|{Mention}|{MENTION}/g)) {
        cadena = cadena.replace(/{mention}|{Mention}|{MENTION}/g, `<@${member.user.id}>`)
    }
    return cadena
}

exports.defaultAvatar = "https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png"

const menuhelpformat = (array) => {
    let cadena = "";
    for (let i = 0; i < array.length; i++) {
        let palabra = array[i]
        let espacios = 19 - palabra.length
        cadena += palabra + " ".repeat(espacios);
        if ((i + 1) % 3 === 0) {
            cadena += "\n";
        }
    }
    return `\`\`\`\n${cadena}\n\`\`\``;
}

exports.helpcommands = (prefix, comandos, category) => {
    return menuhelpformat(comandos.filter((c) => c.help.category == category).map((c) => { 
        return { 
            nombre: c.help.name, 
            status: c.help.status 
        }
    }).map((c, i) => {
        return `[${c.status.code == 1 ? "🟢": "🔴"}] ${prefix}${c.nombre}`
    }))
}

exports.Alert = class {
    /**
     * @param {string} web
     * @param {string} text 
     * @returns {Canvas.Canvas}
     */
    constructor(web, text) {
        const canvas = Canvas.createCanvas(900, 300);
        const ctx = canvas.getContext('2d');

        const rectanguloRedondeado = (x, y, w, h, r) => {
            const x2 = x + w;
            const y2 = y + h;

            ctx.moveTo(x + r, y);
            ctx.lineTo(x2 - r, y);
            ctx.quadraticCurveTo(x2, y, x2, y + r);
            ctx.lineTo(x2, y2 - r);
            ctx.quadraticCurveTo(x2, y2, x2 - r, y2);
            ctx.lineTo(x + r, y2);
            ctx.quadraticCurveTo(x, y2, x, y2 - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
        }

        ctx.fillStyle = '#353535';
        ctx.beginPath();
        rectanguloRedondeado(0, 0, canvas.width, canvas.height, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 32px Arial"
        ctx.fillStyle = 'white';
        ctx.textAlign = "left";
        ctx.textBaseline = "hanging"
        ctx.fillText(`${web} dice`, canvas.width * .04, canvas.height * .16)

        ctx.font = "29px Arial"
        ctx.fillStyle = 'white';
        ctx.textAlign = "left";
        ctx.textBaseline = "hanging"
        ctx.fillText(`${text}`, canvas.width * .04, canvas.height * .38)

        ctx.fillStyle = '#5e9eff';
        ctx.beginPath();
        rectanguloRedondeado(canvas.width * .75, canvas.height * .65, canvas.width / 5, canvas.height / 4.5, 7.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = "28px Arial"
        ctx.fillStyle = '#353535';
        ctx.textAlign = "center";
        ctx.textBaseline = "hanging"
        ctx.fillText('Aceptar', canvas.width * .85, canvas.height * .706)

        return canvas.toBuffer();
    }
}

exports.Ship = class {
    /**
     * @param {User} user_1 
     * @param {User} user_2 
     * @param {number} porcentage 
     */
    async buildImage(user_1, user_2, porcentage) {
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');
        let background = await Canvas.loadImage("https://media.discordapp.net/attachments/809089744574611507/961338394699513906/unknown.png");
        let drawAvatar1 = await Canvas.loadImage(user_1.avatar ? user_1.avatarURL({ forceStatic: true, size: 2048, extension: "png" }) : "https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png")
        let drawAvatar2 = await Canvas.loadImage(user_2.avatar ? user_2.avatarURL({ forceStatic: true, size: 2048, extension: "png" }) : "https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png")

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.shadowOffsetY = 6;
        ctx.shadowColor = "#91c4c2";
        ctx.shadowBlur = 6;
        ctx.font = "bold 40pt Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText(`${porcentage.toString()}%`, canvas.width / 2, canvas.height / 1.7)

        ctx.shadowOffsetY = 6;
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 30;

        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(50 + 100, 25 + 100, 100 + 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.save()
        ctx.beginPath()
        ctx.arc(50 + 100, 25 + 100, 100, 0, Math.PI * 2, true)
        ctx.closePath();
        ctx.clip()
        ctx.drawImage(drawAvatar1, 50, 25, 200, 200)
        ctx.restore()

        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(450 + 100, 25 + 100, 100 + 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.save()
        ctx.beginPath()
        ctx.arc(450 + 100, 25 + 100, 100, 0, Math.PI * 2, true)
        ctx.closePath();
        ctx.clip()
        ctx.drawImage(drawAvatar2, 450, 25, 200, 200)
        ctx.restore()

        return canvas.toBuffer();
    }
}

exports.switchPorcentageInDiferentsUsers = (number, user1, user2) => {
    if (number <= 10) return `:confounded: muchos dicen que los que se odian se aman..\npero no creo que entre **${user1.username}** y **${user2.username}** la frase este en lo cierto`;
    else if (number <= 30) return `:handshake: **${user1.username}** y **${user2.username}** pueden conservarse como conocidos y si hay mas platica pueden ser amigos`;
    else if (number <= 45) return `:wink: **${user1.username}** y **${user2.username}** podrian ser socios o amigos pero creo que hasta ahi se conservaria todo`;
    else if (number <= 60) return `:kissing_smiling_eyes: **${user1.username}** y **${user2.username}** son los mejores amigos, puede que incluso puedan ser hermanos de otra sangre`;
    else if (number <= 77) return `:cupid: **${user1.username}** y **${user2.username}** son muy buenos amigos y quizas si se juntan o se conocen mas esto termine en otra cosa`;
    else if (number <= 89) return `:gift_heart: hay una fuerte relacion entre **${user1.username}** y **${user2.username}** es algo que los une.. pareciera ser que nada los puede separar`;
    else if (number <= 97) return `:heartbeat: una buena, fuerte y duradera relacion entre **${user1.username}** y **${user2.username}** perfecto para desarrollar un posible matrimonio`;
    else if (number <= 100) return `:sparkling_heart: quizas uno de los mejores shipeos de la historia.. **${user1.username}** y **${user2.username}** Dejenme tomar una foto de este momento!`;
}
exports.switchPorcentageInAuthorAndUser = (number, user1, author) => {
    if (number <= 10) return `:confounded: lo siento.. pero shipearte con **${user1.username}** no es una buena opcion`;
    else if (number <= 30) return `:handshake: sean amigos y solo eso`;
    else if (number <= 45) return `:wink: podrian ser socios o amigos pero creo que hasta ahi se conservaria todo`;
    else if (number <= 60) return `:kissing_smiling_eyes: pueden ser mejores amigos, puede que incluso puedan ser hermanos de otra sangre`;
    else if (number <= 77) return `:cupid: son muy buenos amigos y quizas si se juntan o se conocen mas esto termine en otra cosa`;
    else if (number <= 89) return `:gift_heart: hay una fuerte relacion entre tu y **${user1.username}** es algo que los une.. pareciera ser que nada los puede separar`;
    else if (number <= 97) return `:heartbeat: una buena, fuerte y duradera relacion entre tu y **${user1.username}** perfecto para desarrollar un posible matrimonio\nbueno.. si tu quieres verdad¿`;
    else if (number <= 100) return `:sparkling_heart: quizas uno de los mejores shipeos de la historia.. **${author.username}** y **${user1.username}** Dejenme tomar una foto de este momento!`;
}
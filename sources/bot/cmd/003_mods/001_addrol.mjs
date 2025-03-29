import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'addrol'
const id = '001'

let help = {
    alias: [],
    description: 'Añade roles a un usuario',
    category: '003',
    options: [{
        name: 'member',
        alias: [],
        description: 'Menciona el usuario',
        required: true,
        options: []
    }, {
        name: 'roles',
        alias: [],
        description: 'Menciona hasta tres roles a colocar',
        required: true,
        options: []
    }],
    permissions: {
        bot: [
            discord.PermissionFlagsBits.ManageRoles
        ],
        user: [
            discord.PermissionFlagsBits.ManageRoles
        ]
    },
    inactive: true,
    reason: "comando en desarrollo, los comandos de moderacion aun estan en prueba",
    nsfw: false,
    cooldown: 3
}

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {string[]} args
 */
async function main(client, message, args) {
    let identifier = args[0];
    let validator, member, roles, valid_roles, final;
    let embed = new discord.EmbedBuilder({
        color: discord.Colors.Red
    })

    if (!identifier) {
        await message.reply({ embeds: [embed.setDescription('> la opcion `<usuario>` es requerida.')] })
        return 1
    }

    validator = new config.Member(message, identifier)

    if (!(await validator.valid())) {
        await message.reply({ embeds: [embed.setDescription('> opcion `<usuario>` no valida, no se ha podido obtener el usuario')] })
        return 1
    }

    validate_user(message, validator.getMember())

    member = validator.getMember()

    identifier = args[1];

    if (!identifier) {
        await message.reply({ embeds: [embed.setDescription('> la opcion `<roles>` es requerida.')] })
        return 1
    }

    roles = await get_roles(message, args)

    if (roles.length <= 0) {
        await message.reply({ embeds: [embed.setDescription('> Ninguno de los argumentos dados en la opcion `<roles>` corresponde a un rol')] })
        return 1
    }

    valid_roles = await validate_roles(message, roles, validator.getMember())

    if (valid_roles.length <= 0) {
        await message.reply({ embeds: [embed.setDescription('> Ninguno de los roles dados en la opcion `<roles>` es valido')] })
        return 1
    }

    try {
        await member.roles.add(valid_roles)
        
        await message.reply({
            embeds: []
        })
    } catch (error) {
        await message.reply({
            embeds: [embed.setDescription('> Ha sucedido un error interno, contacta al desarrollador')]
        })
    }

    return 0
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
async function slash(client, interaction) {
    return 0
}

/**
 * @param {discord.Message} message 
 * @param {discord.GuildMember} member 
 */
async function validate_user(message, member) {
    if (member.id == message.guild.members.me.id) {
        await message.reply({ embeds: [embed.setDescription('> No puedo añadirme un rol')] })
        return 1
    }
    if (member.id == message.member.id) {
        await message.reply({ embeds: [embed.setDescription('> No puedes añadirte un rol por medio de este comando')] })
        return 1
    }
    if (member.id == message.guild.ownerId) {
        await message.reply({ embeds: [embed.setDescription('> No se pueden realizar movimientos sobre el dueño del servidor')] })
        return 1
    }
    if (member.user.bot) {
        await message.reply({ embeds: [embed.setDescription('> No se pueden realizar movimientos sobre bots')] })
        return 1
    }
    return 0
}

/**
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function get_roles(message, args) {
    let list, role_list = await message.guild.roles.fetch()
    list = [...new Set(args.slice(1, 4).filter(ident => !['@everyone', '@here'].includes(ident)).map(item => item.match(/\d+/)[0]))].filter(id => role_list.has(id))
    return list
}

/**
 * @param {discord.Message} message 
 * @param {string[]} id_rolelist 
 * @param {discord.GuildMember} member 
 */
async function validate_roles(message, id_rolelist, member) {
    let embed = new discord.EmbedBuilder({ color: discord.Colors.Orange })
    let roles = await message.guild.roles.fetch()
    let bot_highest = message.guild.members.me.roles.highest
    let user_highest = message.member.roles.highest
    let target_highest = member.roles.highest

    return id_rolelist.filter(async role_id => {
        let role = roles.get(role_id)

        embed.setDescription(`> No se puede añadir el rol \`${role.name}\``)

        if (!role) return false

        if (bot_highest.comparePositionTo(role) <= 0) {
            await message.reply({
                embeds: [embed.setFields([{ name: 'Razon', value: config.code_text('- El rol es de mayor jerarquia al mio', 'diff') }])]
            }).then(res => {
                setTimeout(async () => {
                    await res.delete()
                }, 5000);
            })
            return false
        }

        if (user_highest.comparePositionTo(role) <= 0) {
            await message.reply({
                embeds: [embed.setFields([{ name: 'Razon', value: config.code_text('- No tienes permisos suficientes para gestionar este rol', 'diff') }])]
            }).then(res => {
                setTimeout(async () => {
                    await res.delete()
                }, 5000);
            })
            return false
        }

        if (user_highest.comparePositionTo(target_highest) <= 0) {
            await message.reply({
                embeds: [embed.setFields([{ name: 'Razon', value: config.code_text('- No puedes colocar roles a alguien de mayor jerarquia que tu', 'diff') }])]
            }).then(res => {
                setTimeout(async () => {
                    await res.delete()
                }, 5000);
            })
            return false
        }

        if (role.permissions.has(discord.PermissionFlagsBits.Administrator)) {
            await message.reply({
                embeds: [embed.setFields([{ name: 'Razon', value: config.code_text('- No puedo añadir roles con permiso de administrador', 'diff') }])]
            }).then(res => {
                setTimeout(async () => {
                    await res.delete()
                }, 5000);
            })
            return false
        }

        return true
    })
}

export {
    name,
    id,
    help,
    main,
    slash
}
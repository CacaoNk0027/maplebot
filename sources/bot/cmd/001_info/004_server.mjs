import * as discord from 'discord.js';
import * as config from '../../config/config.mjs';

const name = "server";
const id = "004";

let help = {
    alias: ["servidor"],
    description: "Comando para obtener información del servidor, su icono, banner y más.",
    category: "001",
    options: [
        { name: "info", description: "Muestra información del servidor" },
        { name: "icono", description: "Muestra el icono del servidor" },
        { name: "banner", description: "Muestra el banner del servidor" }
    ],
    permissions: {
        user: [],
        bot: []
    },
    inactive: false,
    reason: null,
    nsfw: false,
    cooldown: 3
};

/**
 * Comando server para texto (prefijo)
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    const subcommand = args[0]; // Obtiene el subcomando (info, icono, banner)
    const guild = message.guild;

    if (!guild) {
        return message.reply("Este comando solo puede usarse en servidores.");
    }

    try {
        switch (subcommand) {
            case "info":
                await handleInfo(guild, message);
                break;
            case "icono":
                await handleIcon(guild, message);
                break;
            case "banner":
                await handleBanner(guild, message);
                break;
            default:
                await message.reply("Por favor, usa un subcomando válido: `info`, `icono` o `banner`.");
                break;
        }
    } catch (error) {
        console.error(error);
        await message.reply("Hubo un error al ejecutar el comando.");
    }
}

/**
 * Comando server para slash commands
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    const { options, guild } = interaction;

    if (!guild) {
        return interaction.reply({ content: "Este comando solo puede usarse en servidores.", ephemeral: true });
    }

    try {
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case "info":
                await handleInfo(guild, interaction);
                break;
            case "icono":
                await handleIcon(guild, interaction);
                break;
            case "banner":
                await handleBanner(guild, interaction);
                break;
            default:
                await interaction.reply({ content: "Subcomando no válido.", ephemeral: true });
                break;
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "Hubo un error al ejecutar el comando.", ephemeral: true });
    }
}

/**
 * Maneja el subcomando info
 */
async function handleInfo(guild, target) {
    await guild.members.fetch();
    const owner = await guild.fetchOwner();
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const miembros = guild.members.cache.filter(m => !m.user.bot).size;
    const total = guild.memberCount.toString();
    const iconURL = guild.iconURL({ dynamic: true, size: 512 });

    const embed = new discord.EmbedBuilder()
        .setColor('Blurple')
        .setThumbnail(iconURL || null)
        .setTitle('Información del servidor')
        .addFields([
            { name: "Nombre", value: `\`\`\`${guild.name}\`\`\``, inline: true },
            { name: "Owner 👑", value: `\`\`\`${owner.user.tag}\`\`\``, inline: true },
            { name: "Descripción", value: `\`\`\`${guild.description || "Sin descripción."}\`\`\``, inline: false },
            { name: "Número de miembros", value: `\`\`\`Miembros: ${miembros} | Bots: ${bots} | Total: ${total}\`\`\``, inline: false },
            { name: "Canales 🏓", value: `\`\`\`Categorías: ${guild.channels.cache.filter(c => c.type === discord.ChannelType.GuildCategory).size} | Texto: ${guild.channels.cache.filter(c => c.type === discord.ChannelType.GuildText).size} | Voz: ${guild.channels.cache.filter(c => c.type === discord.ChannelType.GuildVoice).size}\`\`\``, inline: false },
            { name: "Cantidad de Impulsos (Boosts)", value: `\`\`\`Mejoras: ${guild.premiumSubscriptionCount}\`\`\``, inline: false },
            { name: "Nivel de Impulsos (Boosts)", value: `\`\`\`Nivel: ${guild.premiumTier || "Sin nivel"}\`\`\``, inline: false },
            { name: "Roles & Emojis ☕", value: `\`\`\`Roles: ${guild.roles.cache.size} | Emojis: ${guild.emojis.cache.size}\`\`\``, inline: false },
            { name: "Fecha de creación 📅", value: `<t:${Math.floor(guild.createdAt.getTime() / 1000)}:F>`, inline: false }
        ])
        .setTimestamp()
        .setFooter({ text: guild.name, iconURL });

    if (target instanceof discord.Message) {
        await target.reply({ embeds: [embed] });
    } else {
        await target.reply({ embeds: [embed] });
    }
}

/**
 * Maneja el subcomando icono
 */
async function handleIcon(guild, target) {
    const iconURL = guild.iconURL({ dynamic: true, size: 512 });

    if (iconURL) {
        const embed = new discord.EmbedBuilder()
            .setTitle("Icono del servidor")
            .setImage(iconURL)
            .setFooter({ text: guild.name, iconURL });

        if (target instanceof discord.Message) {
            await target.reply({ embeds: [embed] });
        } else {
            await target.reply({ embeds: [embed] });
        }
    } else {
        if (target instanceof discord.Message) {
            await target.reply("El servidor no tiene icono.");
        } else {
            await target.reply({ content: "El servidor no tiene icono.", ephemeral: true });
        }
    }
}

/**
 * Maneja el subcomando banner
 */
async function handleBanner(guild, target) {
    const bannerURL = guild.bannerURL({ dynamic: true, size: 512 });

    if (bannerURL) {
        const embed = new discord.EmbedBuilder()
            .setTitle("Banner del servidor")
            .setImage(bannerURL)
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true, size: 512 }) });

        if (target instanceof discord.Message) {
            await target.reply({ embeds: [embed] });
        } else {
            await target.reply({ embeds: [embed] });
        }
    } else {
        if (target instanceof discord.Message) {
            await target.reply("El servidor no tiene banner.");
        } else {
            await target.reply({ content: "El servidor no tiene banner.", ephemeral: true });
        }
    }
}

export {
    name,
    id,
    help,
    main,
    slash
};

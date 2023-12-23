'use strict';
const discord = require('discord.js')
let moment = require("moment")
module.exports = {
    /**
     * @param {discord.Client} client
     * @param {discord.Guild} guild
     */
    guilds: async (client, guild) => {
        if(!client) throw new Error('Necesitas colocar el parametro client!')
        if(!guild) throw new Error('Necesitas colocar el parametro guild!')
        return `🆔 ID | ${guild.id}\n👑 Owner | ${(await guild.fetchOwner()).user.username}\n🕗 Creado un | <t:${moment(guild.createdAt).unix()}:F>`
    },
    /**
     * @param {discord.Guild} guild 
     * @param {string} nivel
     */
    general: (guild, nivel) => {
        if(!guild) throw new Error('Necesitas colocar el parametro guild!')
        if(!nivel) throw new Error('Necesitas colocar el parametro nivel!')
        return `<:Dis_rol:888234105332981781> **roles |** ${guild.roles.cache.size}\n😹 **emojis |** ${guild.emojis.cache.size}\n<:Dis_sticker:888234162903994378> **stickers |** ${guild.stickers.cache.size}\n<:Dis_bg_verifiedMod:888236515526844448> **Moderación |** ${nivel}`
    },
    /**
     * @param {discord.Guild} guild 
     */
    datos: function (guild) {
        let explicitContent, afk, notifications, system, description;
        switch(guild.explicitContentFilter) {
            case 2: explicitContent ="analizar contenido de todos los miembros"
            break;
            case 1: explicitContent = "analizar contenido de todos los miembros sin roles"
            break;
            case 0: explicitContent = "no analizar contenido"
            break;
        }
        switch(guild.defaultMessageNotifications) {
            case 0: notifications = "Todos los Mensajes"
            break;
            case 1: notifications = "Solo menciones";
            break;
        }
        afk = guild.afkChannel == null ? "Sin Canal Afk": `<#${guild.afkChannelId}>\n-ID: ${guild.afkChannelId}`
        system = guild.systemChannel == null ? "Sin Canal de Mensajes del sistema": `<#${guild.systemChannelId}>\n-ID: ${guild.systemChannelId}`
        description = guild.description == null ? "Sin Descripción": `${guild.description}`
        return `<:mkLove:869814289727381575> **+18 ( filtro )** | ${explicitContent}\n💤 **Canal Afk |** ${afk}\n<:Dis_ping:888234422590115940> **Notificaciones |** ${notifications}\n👥 **Maximo de miembros |** ${guild.maximumMembers}\n<a:mkDiscord:836435775935086592> **Canal del sistema |** ${system}\n💬 **Descripción**\n${description}`
    },
    /**
     * 
     * @param {discord.Client} client 
     * @param {discord.Guild} guild 
     * @param {discord.GuildMember} member
     */
    comunidad: function (guild, member) {
        if(!guild.features.includes('COMMUNITY')) return;
        let rules, escenarios, anuncios, moderador, hilos;
        rules = guild.rulesChannel == null ? "Sin Sanal de Reglas": `<#${guild.rulesChannelId}>\n-ID: ${guild.rulesChannelId}`
        anuncios = guild.channels.cache.filter(ch => ch.type == 5).size
        escenarios = guild.channels.cache.filter(ch => ch.type == 13).size
        hilos = guild.channels.cache.filter(ch => ch.type == 10).size + guild.channels.cache.filter(ch => ch.type == 12).size + guild.channels.cache.filter(ch => ch.type == 11).size
        moderador = guild.channels.cache.get(guild.publicUpdatesChannelId).permissionsFor(member.user.id).has('ViewChannel') ? `<:Dis_bg_hypesquad:888237819003273299> **Canal de Actualizaciones de Comunidad |** <#${guild.publicUpdatesChannelId}>\n-ID: ${guild.publicUpdatesChannelId}` : ""
        return `<:Dis_channelRules:888231318876487731> **Canal de reglas |** ${rules}\n<:Dis_channelAds:888230970266906624> **Canales de auncios |** ${anuncios}\n<:Dis_channelStage:888230718780633108> **Escenarios |** ${escenarios}\n<:Dis_channelThread:888230841942151171> **Hilos activos |** ${hilos}\n${moderador}`
    }
}
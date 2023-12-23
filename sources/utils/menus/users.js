'use strict';
const discord = require('discord.js')
let moment = require('moment')
module.exports = {
    /**
     * @param {discord.GuildMember} member
     */
    user: function (member) {
        return `🆔 **ID |** ${member.user.id}\n🖋️ **Nombre |** ${member.user.username}\n✏️ **Nick |** ${member.nickname == null ? "Sin Apodo": `${member.nickname}`}\n#️⃣ **Tag |** #${member.user.discriminator}`
    },
    /**
     * @param {discord.GuildMember} member 
     */
    dates: function (member) {
        return `🛎️ **A ${member.guild.name}**\n<t:${moment(member.joinedAt).unix()}:F>\n💬 **A Discord**\n<t:${moment(member.user.createdAt).unix()}:F>`
    }, 
    /**
     * @param {discord.GuildMember} member 
     */
    general: async function (member) {
        let userflags = {
            Staff: "<:Dis_bg_employee:888238358118154270>",
            Partner: "<:Dis_bg_partnerSrvOwner:888238884469735494>",
            Hypesquad: "<:Dis_bg_hypesquad:888237819003273299>",
            BugHunterLevel1: "<:Dis_bg_bugHunter_v1:888238587529793596>",
            HypeSquadOnlineHouse1: "<:Dis_bg_hypeBravery:888237733712113684>",
            HypeSquadOnlineHouse2: "<:Dis_bg_hypeBrilliance:888237640745353266>",
            HypeSquadOnlineHouse3: "<:Dis_bg_hypeBalance:888237504162058261>",
            PremiumEarlySupporter: "<:Dis_bg_earlySupporter:888238773635280956>",
            BugHunterLevel2: "<:Dis_bg_bugHunter_v2:888240135525785631>",
            VerifiedBot: "<:Dis_bg_verifiedBot:956799811020025856>",
            VerifiedDeveloper: "<:Dis_bg_verifiedBotDeveloper:888237981830357042>",
            CertifiedModerator: "<:Dis_bg_verifiedMod:888236515526844448>"
        }
        var badges = member.user.flags.toArray().length >= 1 ? member.user.flags.toArray().map(flgs => userflags[flgs]).join(' ') : "Sin Insignias";
        var boost = !member.premiumSince ? "No esta bosteando el servidor" : `Boosteando ${member.guild.name} desde el <t:${moment(member.premiumSinceTimestamp).unix()}:F>`;
        var img = !member.user.avatar ? "Sin avatar": `[Avatar URL](${member.user.avatarURL({ forceStatic: false, size: 4096 })})`;
        var guildAvatar = !member.avatar ? "Sin avatar de servidor": `[GuildAvatar URL](${member.avatarURL({ forceStatic: false, size: 4096 })})`;
        var banner = !(await member.user.fetch()).banner ? "sin banner - banner no detectado":  `[Banner URL](${(await member.user.fetch()).bannerURL({ forceStatic: false, size: 4096 })})`
        return `- **Insignias**\n${badges}\n<:Dis_boostLv3:888234376226295878> **Boost |** ${boost}\n🌆 **Avatar |** ${img}\n🎩 **Avatar de Servidor |** ${guildAvatar}\n🖼 **Banner |** ${banner}`
    }
}
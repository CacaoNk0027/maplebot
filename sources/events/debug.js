// importaciones

require('dotenv').config()
const discord = require('discord.js')
const webhook = new discord.WebhookClient({
    id: process.env['debugId'],
    token: process.env['debugToken']
})

exports.event = {
    name: "debug",
    /**
     * @param {discord.Client} client 
     * @param {string} info 
     */
    exec: async (client, info) => {
        if(info.match('HeartbeatTimer')) return;
        console.info(info);
        await webhook.send({
            embeds: [{
                description: `\`\`\`\n${info}\n\`\`\``,
                title: 'Debug',
                color: 0x44b868,
                timestamp: new Date()
            }]
        })
    }
}
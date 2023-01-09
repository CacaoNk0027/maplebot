const discord = require('discord.js')
const models = require('maplebot_models')
const configs = require('../utils/exports')

exports.event = {
    name: 'interactionCreate',
    /**
     * @param {discord.Client} client 
     * @param {discord.CommandInteraction|discord.ButtonInteraction} interaction 
     */
    exec: async (client, interaction) => {
        if(configs.blacklist.servers.find(c => c.includes(interaction.guildId))) return await interaction.reply({
            content: models.utils.statusError('rolplayDanger', "lo siento pero este servidor esta baneado temporal/permanentemente de mi"),
            ephemeral: true
        });
        if(configs.blacklist.users.find(c => c.includes(interaction.user.id))) return await interaction.reply({
            content: models.utils.statusError('rolplayDanger', "lo siento pero haz sido baneado de mi temporal/permanentemente... no puedes usar mis comandos mas"),
            ephemeral: true
        });

        if(interaction.commandType == 1) {
            let command = client.slashCommands.get(interaction.commandName)
            if(command.help.status.code == 0 && interaction.user.id !== "801603753631285308") return await interaction.reply({
                content: models.utils.statusError('rolplayDanger', `lo siento.. pero actualmente el comando **${interaction.commandName}** esta inactivo debido a lo siguente`) + `\n\`\`\`\nRazon: ${command.help.status.reason == null ? "no hay razon :c" : command.help.status.reason}\n\`\`\``,
                ephemeral: true
            });
            if(command) {
                await command.exec(client, interaction)
            } else {
                await interaction.reply({
                    content: models.utils.statusError('error', `ha habido un error interno en mi y no he podido encontrar el ejecutable del comando, comunicate con mi desarrollador para localizar este problema`),
                    ephemeral: true
                })
            }
        } else if(interaction.isButton() == true) {
            if (await configs._buttonFilter(interaction) == false) return await interaction.reply({
                content: models.utils.statusError('rolplayMe', "esta interaccion no va dirigida a ti"),
                ephemeral: true
            });
            let button = client.buttons.get(interaction.customId);
            if(button) {
                await button.exec(client, interaction)
            } else {
                await interaction.reply({
                    content: models.utils.statusError('error', `ha habido un error interno en mi y no he podido encontrar el ejecutable del boton, comunicate con mi desarrollador para localizar este problema`),
                    ephemeral: true
                })
            }
        }
    }
}
// importaciones

require('dotenv').config()
const discord = require('discord.js')
const { readdir, readdirSync } = require('fs')
const top_gg = require('@top-gg/sdk')
const mongoose = require('mongoose')
const configs = require('../utils/exports')
const Canvas = require('canvas')

Canvas.registerFont('sources/utils/assets/fonts/Honey.otf', {
    family: 'Honey'
})

// creacion del bot

const client = new discord.Client({
    intents: 33287,
    makeCache: discord.Options.cacheWithLimits({
        ThreadManager: 0,
        ReactionManager: 0,
        PresenceManager: 0,
        MessageManager: 100
    }),
    allowedMentions: {
        repliedUser: false 
    }
});

client.login(process.env['token']);

const events = new discord.WebhookClient({
    id: process.env['eventsId'],
    token: process.env['eventsToken']
})

//  conexion con MongoDB

mongoose.set('strictQuery', false);
mongoose.connect(process.env['uri']);
mongoose.connection.once('open', () => console.info('Base de datos conectada'));

// conexion con la api de top.gg

exports.sdk = new top_gg.Api(process.env['topgg_token'])

// arreglos temporales

configs.createCollections(client);

// comandos

readdirSync('sources/commands').forEach(dir => {
    readdir('sources/commands/'+dir, (err, files) => {
		if(err) throw err; 
		let cmdTextFiles = files.filter(f => f.split(".").pop() == "js");
    	if(cmdTextFiles.length <= 0) return; 
        cmdTextFiles.forEach(file => {
			let command = require(`../commands/${dir}/${file}`); 
            try {
                client.comandos.set(command.help.name, { exec: command.text, help: command.help })
            } catch (error) { console.error(error) };
            try {
                client.slashCommands.set(command.help.name, { exec: command.slash, help: command.help })
            } catch (error) { console.error(error) }
        });
    });
});

// botones

readdirSync('sources/buttons').forEach(dir => {
    readdir(`sources/buttons/${dir}`, (err, files) => {
        if(err) throw err;
        let buttonFiles = files.filter(f => f.split(".").pop() == "js");
        if(buttonFiles.length <= 0) return;
        buttonFiles.forEach(file => {
            let button = require(`../buttons/${dir}/${file}`); 
            try {
                client.buttons.set(button.help.customId, { exec: button.exec, help: button.help })
            } catch (error) { console.error(error) };
        })
    })
})

// eventos

readdirSync('sources/events').filter(files => files.split('.').pop() == "js").forEach(file => {
    const { event } = require(`../events/${file}`)
    try {
        client.on(event.name, (...args) => event.exec(client, ...args));
    } catch (error) {
        console.error(error);
    }
})

// errores

process.on('unhandledRejection', async (reason, promise) => {
    console.error(reason);
    await events.send({
        embeds: [{
            title: 'Error',
            description: `ha ocurrido un error al ejecutar una funcion... <:mkMaple_wasted:836376828222111794>`,
            timestamp: Date.now(),
            color: require('../utils/exports').randomColor(),
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL({ extension: 'png', size: 512 })
            },
            provider: {
                name: '@Maple bot'
            },
            fields: [{
                name: 'Informacion',
                value: `\`\`\`\nRechazo no controlado en: ${promise}\nA razon: ${reason}\`\`\``
            }]
        }]
    })
})

// exportacion de la constante client

exports.client = client;
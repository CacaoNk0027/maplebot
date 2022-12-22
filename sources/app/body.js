// importaciones

require('dotenv').config()
const discord = require('discord.js')
const { readdir, readdirSync } = require('fs')
const mongoose = require('mongoose')

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

//  conexion con MongoDB

mongoose.set('strictQuery', false);
mongoose.connect(process.env['uri']);
mongoose.connection.once('open', () => console.info('Base de datos conectada'));

// arreglos temporales

client.comandos = new discord.Collection();
client.slashCommands = new discord.Collection();

// eventos

readdirSync('sources/events').filter(files => files.split('.').pop() == "js").forEach(file => {
    const { event } = require(`../events/${file}`)
    try {
        client.on(event.name, (...args) => event.exec(client, ...args));
    } catch (error) {
        console.error(error);
    }
})

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

// exportacion de la constante client

exports.client = client;
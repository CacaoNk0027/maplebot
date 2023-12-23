module.exports = (obj) => {
return `\`\`\`js\n
Servidores    | ${obj.servers}
Interacciones | ${obj.interactions}
Comandos      | ${obj.commands}
Usuarios      | ${obj.users}
Votos         | ${obj.votos}
Shards        | ${obj.shards}
\n\`\`\``
}
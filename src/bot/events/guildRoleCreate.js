const send = require('../modules/webhooksender')

module.exports = {
  name: 'guildRoleCreate',
  type: 'on',
  handle: async (guild, role) => {
    const botPermissions = Object.keys(guild.members.get(global.bot.user.id).permissions.json)
    if (!botPermissions.includes('viewAuditLogs') || !botPermissions.includes('manageWebhooks')) return
    const guildRoleCreateEvent = {
      guildID: guild.id,
      eventName: 'guildRoleCreate',
      embed: {
        description: 'A role was created ',
        fields: [{
          name: 'Name',
          value: role.name
        }, {
          name: 'Type',
          value: 'User'
        }, {
          name: 'ID',
          value: `\`\`\`ini\nRole = ${role.id}\nPerpetrator = Unknown\`\`\``
        }]
      }
    }
    if (!guild.members.find(m => m.username === role.name)) { // if this isn't an auto role
      if (role.managed && guild.members.find(m => m.username === role.name)) {
        guildRoleCreateEvent.embed.fields[1].value = 'Bot'
      }
      const logs = await guild.getAuditLogs(5, null, 30).catch(() => {})
      if (!logs) return
      const log = logs.entries.find(e => e.targetID === role.id)
      if (!log) return
      const perp = log.user
      if (log && (new Date().getTime() - new Date((log.id / 4194304) + 1420070400000).getTime()) < 3000) {
        if (log.reason) guildRoleCreateEvent.embed.fields[1].value = log.reason
        guildRoleCreateEvent.embed.fields[2].value = `\`\`\`ini\nRole = ${role.id}\nPerpetrator = ${perp.id}\`\`\``
        guildRoleCreateEvent.embed.author = {
          name: `${perp.username}#${perp.discriminator}`,
          icon_url: perp.avatarURL
        }
        await send(guildRoleCreateEvent)
      } else {
        await send(guildRoleCreateEvent)
      }
    } else {
      guildRoleCreateEvent.embed.fields[1] = {
        name: 'ID',
        value: `\`\`\`ini\nRole = ${role.id}\nPerpetrator = Automatically created by invite\`\`\``
      }
    }
  }
}

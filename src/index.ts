import { Client, Collection, GatewayIntentBits } from 'discord.js'
import fs from 'fs'
import { CommandModule } from './utils'
import { token, clientId, guildId } from '../config.json'

if (!token.length || !clientId.length || !guildId.length) {
  console.warn('Configure your config first')
} else {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  })

  client.on('ready', () => {
    if (client?.user) {
      console.log(`Logged in as ${client.user.tag}!`)
    }
  })

  const commands = new Collection<string, CommandModule>()
  const commandFiles = fs
    .readdirSync('./dist/src/commands')
    .filter((file) => file.endsWith('.js'))

  for (const file of commandFiles) {
    const {
      command,
    }: { command: CommandModule } = require(`./commands/${file}`)
    commands.set(command.data.name!, command)
  }

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = commands.get(interaction.commandName)

    try {
      await command!.execute(interaction)
    } catch (error) {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
      console.error(error)
    }
  })

  client.login(token)
}

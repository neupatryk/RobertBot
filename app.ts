import { token, clientId, guildId } from './config.json'
import fs from 'fs'
import { Client, Collection, CommandInteraction, Intents } from 'discord.js'

export interface CommandModule {
  execute(interaction: CommandInteraction): Promise<void>
}

export const urlMap = new Map<string, { url: string; loop: boolean }>()

if (!token.length || !clientId.length || !guildId.length) {
  console.warn('Configure your config first')
} else {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
  })

  client.once('ready', () => {
    console.log('Ready!')
  })

  const commands = new Collection<string, CommandModule>()
  const commandFiles = fs
    .readdirSync('./dist/commands')
    .filter((file) => file.endsWith('.js'))

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`)

    commands.set(command.data.name, command)
  }

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return

    const command = commands.get(interaction.commandName)

    if (!command) return

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
    }
  })

  client.login(token)
}

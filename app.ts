import { token } from './config.json'
import prompt from 'prompt'
import fs from 'fs'
import { Client, Collection, CommandInteraction, Intents } from 'discord.js'

export interface CommandModule {
  execute(interaction: CommandInteraction): Promise<void>
}

if (!token.length) {
  prompt.start()

  prompt.get(['token'], (err, result) => {
    if (err) console.error(err)
    else {
      const config = { token: result.token.toString() }

      fs.writeFile('./config.json', JSON.stringify(config), (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
    }
  })
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

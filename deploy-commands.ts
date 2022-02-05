import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { token, clientId, guildId } from './config.json'
import fs from 'fs'

const commands: any[] = []
const commandFiles = fs
  .readdirSync('./dist/commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(token)

const initCommands = async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest
      .put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      })
      .then(() =>
        console.log('Successfully reloaded application (/) commands.')
      )
      .catch(console.error)
  } catch (error) {
    console.error(error)
  }
}

initCommands()

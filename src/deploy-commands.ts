import { REST, Routes } from 'discord.js'
import fs from 'fs'
import { token, clientId, guildId } from '../config.json'

const commands: any[] = []
const commandFiles = fs
  .readdirSync('./dist/src/commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: '10' }).setToken(token)

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

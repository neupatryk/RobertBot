import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { token, clientId, guildId } from './config.json'

const commands = [
  {
    name: 'play',
    description: 'Play song from url',
  },
]

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

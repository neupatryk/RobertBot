import { token } from './config.json'
import prompt from 'prompt'
import fs from 'fs'
import { Client, Intents } from 'discord.js'

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
  const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

  client.once('ready', () => {
    console.log('Ready!')
  })

  client.login(token)
}

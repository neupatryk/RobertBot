import { SlashCommandBuilder } from '@discordjs/builders'
import { getVoiceConnection } from '@discordjs/voice'
import { CommandInteraction } from 'discord.js'
import { CommandModule } from '../app'

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop music'),
  async execute(interaction: CommandInteraction) {
    if (interaction.guildId) {
      const connection = getVoiceConnection(interaction.guildId)
      if (connection) {
        connection.destroy()
        interaction.reply('Music stopped')
      } else {
        interaction.reply('Robert is not connected to channel')
      }
    }
  },
} as CommandModule

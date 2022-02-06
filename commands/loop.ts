import { SlashCommandBuilder } from '@discordjs/builders'
import { getVoiceConnection } from '@discordjs/voice'
import { CommandInteraction } from 'discord.js'
import { CommandModule, urlMap } from '../app'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Switch looping status for played music'),
  async execute(interaction: CommandInteraction) {
    if (interaction.guildId) {
      const guildId = interaction.guildId
      const connection = getVoiceConnection(interaction.guildId)
      if (connection) {
        if (connection?.state.status === 'ready') {
          const subscription = connection.state.subscription
          if (
            subscription?.player &&
            subscription.player.state.status === 'playing'
          ) {
            const urlConfig = urlMap.get(guildId)
            urlMap.set(guildId, { url: urlConfig!.url, loop: !urlConfig!.loop })
            interaction.reply(
              `Music is${!urlConfig!.loop ? '' : ' not'} looped!`
            )
          } else interaction.reply('Robert is not playing anything')
        } else interaction.reply('Rober is not ready')
      } else interaction.reply('Robert is not connected to channel')
    }
  },
} as CommandModule

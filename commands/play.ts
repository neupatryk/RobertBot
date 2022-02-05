import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandModule } from '../app'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Replies with Pong!'),
  async execute(interaction: { reply: (msg: string) => any }) {
    await interaction.reply('Pong!')
  },
} as CommandModule

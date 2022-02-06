import { SlashCommandBuilder } from '@discordjs/builders'
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
  VoiceConnectionStatus,
} from '@discordjs/voice'
import { CommandInteraction, GuildMember } from 'discord.js'
import ytdl from 'ytdl-core'
import { CommandModule } from '../app'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music from url')
    .addStringOption((option) =>
      option
        .setName('url')
        .setRequired(true)
        .setDescription('Link to youtube video to play')
    ),
  async execute(interaction: CommandInteraction) {
    const member: GuildMember = interaction.member as GuildMember
    const channelId = member.voice.channelId

    if (!interaction.guildId || !channelId) {
      interaction.reply('You are not connected to channel')
      return
    }

    const connection = joinVoiceChannel({
      channelId: channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild!.voiceAdapterCreator,
    })

    const url = interaction.options.get('url')!.value as string

    const stream = ytdl(url, {
      filter: 'audioonly',
    }).on('error', (error) => {
      interaction.reply('Something went wrong')
      console.error('stream ~ error', error)
      return
    })

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    })

    const player = createAudioPlayer()

    player.play(resource)
    connection.subscribe(player)

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy()
    })

    interaction.reply('Playing ' + url)
  },
} as CommandModule

import { SlashCommandBuilder } from '@discordjs/builders'
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} from '@discordjs/voice'
import { CommandInteraction, GuildMember } from 'discord.js'
import ytdl from 'ytdl-core'
import { urlMap, CommandModule } from '../utils'

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

    const guildId = interaction.guildId

    const connection = joinVoiceChannel({
      channelId: channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild!.voiceAdapterCreator,
    })

    const url = interaction.options.get('url')!.value as string

    const stream = ytdl(url, {
      filter: 'audioonly',
    }).on('error', async (error: any) => {
      player.stop(true)
      console.error('Play Error:', error)

      if (interaction.replied) {
        await interaction.editReply('Something went wrong :confused:')
      } else {
        await interaction.reply('Something went wrong :confused:')
      }
    })

    const player = createAudioPlayer()

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    })

    player.play(resource)
    connection.subscribe(player)

    const urlConfig = urlMap.get(guildId)
    urlMap.set(guildId, {
      url: url,
      loop: urlConfig?.loop ? urlConfig.loop : false,
    })

    player
      .on(AudioPlayerStatus.Idle, () => {
        const urlConfig = urlMap.get(guildId)
        if (urlConfig!.loop) {
          const stream = ytdl(url, {
            filter: 'audioonly',
          })
          const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
          })
          player.play(resource)
        } else {
          urlMap.delete(guildId)
          connection.destroy()
        }
      })
      .on(AudioPlayerStatus.Playing, async () => {
        if (!interaction.replied) await interaction.reply('Playing ' + url)
      })
  },
} as CommandModule

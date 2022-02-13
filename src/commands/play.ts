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

    const valid = ytdl.validateURL(url)

    if (valid) {
      const createStream = (url: string) => {
        return ytdl(url, {
          filter: 'audioonly',
        })
      }

      const urlConfig = urlMap.get(guildId)
      urlMap.set(guildId, {
        loop: urlConfig?.loop ? urlConfig.loop : false,
      })

      const player = createAudioPlayer()

      const conn = connection.subscribe(player)
      const resource = createAudioResource(createStream(url), {
        inputType: StreamType.Arbitrary,
      })

      player
        .on('error', async (error) => {
          const resource = createAudioResource(createStream(url), {
            inputType: StreamType.Arbitrary,
          })
          conn?.player.play(resource)
          console.error(error)
        })
        .on(AudioPlayerStatus.Idle, () => {
          const isLoop = urlMap.get(guildId)?.loop
          if (isLoop) {
            const resource = createAudioResource(createStream(url), {
              inputType: StreamType.Arbitrary,
            })
            conn?.player.play(resource)
          } else {
            conn?.connection.destroy()
          }
        })
        .play(resource)

      interaction.reply('Playing ' + url)
    } else {
      interaction.reply('Provide correct youtube link')
    }
  },
} as CommandModule

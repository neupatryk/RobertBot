import { SlashCommandBuilder } from '@discordjs/builders'
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  StreamType,
} from '@discordjs/voice'
import { CommandInteraction, GuildMember } from 'discord.js'
import ytdl from 'discord-ytdl-core'
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
      adapterCreator: interaction.guild!
        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    })

    const url = interaction.options.get('url')!.value as string

    const valid = ytdl.validateURL(url)

    if (valid) {
      const createStream = (url: string, begin: number) => {
        return ytdl(url, {
          filter: 'audioonly',
          opusEncoded: true,
          encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'],
          seek: begin,
          quality: 'lowest',
        })
      }

      let interval: NodeJS.Timer
      let begin = 0
      const urlConfig = urlMap.get(guildId)
      urlMap.set(guildId, {
        loop: urlConfig?.loop ? urlConfig.loop : false,
      })

      const player = createAudioPlayer()
      const conn = connection.subscribe(player)
      const stream = createStream(url, begin)
      const resource = createAudioResource(stream, {
        inputType: StreamType.Opus,
      })

      player
        .on('error', async (error) => {
          const resource = createAudioResource(createStream(url, begin), {
            inputType: StreamType.Opus,
          })
          conn?.player.play(resource)
          console.error(error)
        })
        .on(AudioPlayerStatus.Idle, async () => {
          const isLoop = urlMap.get(guildId)?.loop
          if (isLoop) {
            begin = 0
            const resource = createAudioResource(createStream(url, begin), {
              inputType: StreamType.Opus,
            })
            conn?.player.play(resource)
          } else {
            clearInterval(interval)
            urlMap.delete(guildId)
            conn?.connection.destroy()
          }
        })
        .play(resource)

      interval = setInterval(() => begin++, 1000)
      interaction.reply('Playing ' + url)
    } else {
      interaction.reply('Provide correct youtube link')
    }
  },
} as CommandModule

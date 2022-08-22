import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} from '@discordjs/voice'
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from 'discord.js'
import { Readable, Duplex } from 'stream'
import fetch from 'node-fetch'
import youtubeDlExec from 'youtube-dl-exec'
import { CommandModule, urlMap } from '../utils'
import Ffmpeg from 'fluent-ffmpeg'
import pathToFfmpeg from 'ffmpeg-static'

export const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music from url')
    .addStringOption((option) =>
      option
        .setName('url')
        .setRequired(true)
        .setDescription('Link to youtube video to play')
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const { guildId } = interaction

    const connection = joinVoiceChannel({
      channelId: (interaction.member as GuildMember).voice.channelId!,
      guildId: guildId!,
      adapterCreator: interaction.guild!.voiceAdapterCreator,
    })

    const url = interaction.options.get('url')!.value as string
    const videoJson = await youtubeDlExec(url, { dumpJson: true })

    const format = videoJson.formats
      .filter(({ format }) => format.indexOf('audio only') > -1)
      .reduce((prev, curr) => {
        if (prev.quality > curr.quality) return prev
        return curr
      })

    const createStream = async () => {
      const duplexStream = new Duplex({
        read: () => {},
        write: (chunk, encoding, next) => {
          duplexStream.push(chunk)
          next()
        },
      }).on('error', console.log)

      const body = await fetch(format.url).then((res) => res.body)
      const readableStream = new Readable().wrap(body!).on('error', console.log)

      Ffmpeg(readableStream)
        .noVideo()
        .setFfmpegPath(pathToFfmpeg)
        .format(format.ext)
        .writeToStream(duplexStream)

      return duplexStream
    }

    const resource = createAudioResource(await createStream())
    const player = createAudioPlayer()
    player.on('error', console.log)

    player.play(resource)
    connection.subscribe(player)

    const urlConfig = urlMap.get(guildId!)
    urlMap.set(guildId!, {
      url: url,
      loop: urlConfig?.loop ? urlConfig.loop : false,
    })

    player.on(AudioPlayerStatus.Idle, async () => {
      const urlConfig = urlMap.get(guildId!)
      if (urlConfig!.loop) {
        const resource = createAudioResource(await createStream())
        player.play(resource)
      } else {
        urlMap.delete(guildId!)
        connection.destroy()
      }
    })

    interaction.reply('Playing ' + url)
  },
}

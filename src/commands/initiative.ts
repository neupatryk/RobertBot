import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message } from 'discord.js'
import { CommandModule, initiativeMap } from '../utils'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ini')
    .setDescription(
      'Create Initiative list. If provided with initiative roll, Robert will add it to existing list'
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setRequired(false)
        .setDescription(
          'Name that will be listed on initiative. If left empty your user name will be used'
        )
    )
    .addNumberOption((option) =>
      option
        .setName('initiative')
        .setDescription('Your initiative roll')
        .setMaxValue(30)
        .setRequired(false)
    ),
  async execute(interaction: CommandInteraction) {
    if (interaction.guildId) {
      const guildId = interaction.guildId
      if (interaction.options.get('initiative')?.value) {
        const initiativeRoll = interaction.options.get('initiative')!
          .value as number
        const initiativeList = initiativeMap.get(guildId)
        let name: string
        let initiativeEntries: { [name: string]: number }

        if (interaction.options.get('name')?.value) {
          name = interaction.options.get('name')!.value as string
        } else {
          name = interaction.member?.user.username as string
        }

        if (initiativeList) {
          initiativeEntries = initiativeList.entries
          initiativeEntries[name] = initiativeRoll
          initiativeList.messageHook.delete()
        } else {
          initiativeEntries = {}
          initiativeEntries[name] = initiativeRoll
        }

        const msgBody = Object.keys(initiativeEntries)
          .sort((firstKey, secondKey) => {
            if (initiativeEntries[firstKey] < initiativeEntries[secondKey])
              return 1
            if (initiativeEntries[firstKey] === initiativeEntries[secondKey])
              return 0
            return -1
          })
          .reduce((prevMsg, currentKey) => {
            return (
              prevMsg + currentKey + ': ' + initiativeEntries[currentKey] + '\n'
            )
          }, '')

        interaction.reply(msgBody)
        interaction.fetchReply().then((msg) => {
          initiativeMap.set(guildId, {
            messageHook: msg as Message,
            entries: initiativeEntries,
          })
        })
      } else if (interaction.options.get('name')?.value) {
        interaction.reply(
          'You are missing initiative roll. Roll a dice and add initiative modifier.'
        )
      } else {
        interaction.reply(
          'New initiative order is set. Type your rolls and names with /ini name roll.'
        )
        interaction.fetchReply().then((msg) => {
          initiativeMap.set(guildId, {
            messageHook: msg as Message,
            entries: {},
          })
        })
      }
    }
  },
} as CommandModule

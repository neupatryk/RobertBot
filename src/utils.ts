import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js'

export interface CommandModule {
  execute(interaction: ChatInputCommandInteraction): Promise<void>
  data: Partial<SlashCommandBuilder>
}

export interface initiativeType {
  messageHook: Message
  entries: { [name: string]: number }
}

export const urlMap = new Map<string, { url: string; loop: boolean }>()

export const initiativeMap = new Map<string, initiativeType>()

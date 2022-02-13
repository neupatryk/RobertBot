import { CommandInteraction, Message } from 'discord.js'

export interface CommandModule {
  execute(interaction: CommandInteraction): Promise<void>
}

export interface initiativeType {
  messageHook: Message
  entries: { [name: string]: number }
}

export const urlMap = new Map<string, { loop: boolean }>()

export const initiativeMap = new Map<string, initiativeType>()

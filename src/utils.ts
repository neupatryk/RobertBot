import { CommandInteraction } from 'discord.js'

export interface CommandModule {
  execute(interaction: CommandInteraction): Promise<void>
}

export const urlMap = new Map<string, { url: string; loop: boolean }>()

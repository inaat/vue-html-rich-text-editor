import type { EditorCommand } from '../types'

export class CommandRegistry {
  private commands = new Map<string, EditorCommand>()

  constructor(initial: EditorCommand[] = []) {
    initial.forEach((cmd) => this.register(cmd))
  }

  register(command: EditorCommand): void {
    this.commands.set(command.id, command)
  }

  unregister(id: string): void {
    this.commands.delete(id)
  }

  get(id: string): EditorCommand | undefined {
    return this.commands.get(id)
  }

  all(): EditorCommand[] {
    return Array.from(this.commands.values())
  }
}

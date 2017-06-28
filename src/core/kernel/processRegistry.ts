/*
 * Copyright (c) 2016 Dessix.
 *
 * Original code here: https://github.com/Dessix/Primal/blob/master/src/kernel/processRegistry.ts
 */

export class ProcessRegistry {
  private static readonly registry: { [procName: string]: ProcessConstructor | undefined } = {}

  public static get registations(): Readonly<typeof ProcessRegistry.registry> {
    return this.registry as Readonly<typeof ProcessRegistry.registry>
  }

  public static register(ctor: ProcessConstructor): void {
    ProcessRegistry.registry[ctor.className] = ctor
  }

  public static fetch(className: string): ProcessConstructor | undefined {
    return ProcessRegistry.registry[className]
  }
}

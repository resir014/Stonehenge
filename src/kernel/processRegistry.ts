export class ProcessRegistry {
  private static readonly registry: { [procName: string]: ProcessConstructor | undefined } = {};

  public static get registrations(): Readonly<typeof ProcessRegistry.registry> {
    return this.registry as Readonly<typeof ProcessRegistry.registry>;
  }

  public static register(ctor: ProcessConstructor): void {
    ProcessRegistry.registry[ctor.className] = ctor;
  }

  public static fetch(className: string): ProcessConstructor | undefined {
    return ProcessRegistry.registry[className];
  }
}

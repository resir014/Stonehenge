abstract class Module {
  private className: string;
  private config: IModuleConfig | undefined;

  constructor(className: string, config?: IModuleConfig) {
    this.className = className;
    this.config = config || undefined;
  }

  public abstract run(...args: any[]): IModuleResponse;

  /**
   * Bootstrap the module. Create a memory entry for the module configs if
   * it doesn't exist yet.
   */
  public bootstrap(): void {
    if (!Memory.modules[this.className]) {
      if (this.config) {
        Memory.modules[this.className] = this.config;
      } else {
        Memory.modules[this.className] = {};
      }
    }
  }
}

export default Module;

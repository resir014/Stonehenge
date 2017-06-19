/* tslint:disable */
// Put shims and extensions to installed modules and typings here

// add objects to `global` here
declare namespace NodeJS {
  /**
   * Interface for the global objects.
   */
  interface Global {
    /**
     * Tweak your Logger settings using this global.
     */
    log: {
      level: number,
      showSource: boolean,
      showTick: boolean
    }
    kernel: IKernel
    k: IKernel
    launchNew(className: string): ProcessId | undefined
    reset(): void
    spawnBard(): void
    showBuildQueue(room: Room): void

    c: { [creepName: string]: Creep | undefined }
    s: { [spawnName: string]: Spawn | undefined }
    f: { [flagName: string]: Flag | undefined }
    // id: CliIdProxy;
    sinspect: (val: any) => string
    inspect: (val: any) => void
  }
}

// shim uglify-js for webpack
declare module "uglify-js" {
  export interface MinifyOptions { }
}

/* tslint:disable */
// Put shims and extensions to installed modules and typings here

// add objects to `global` here
declare namespace NodeJS {
  /**
   * Interface for the global objects.
   */
  interface Global {
    /**
     * The accessible global object of the kernel.
     *
     * @type {IKernel}
     * @memberof Global
     */
    kernel: IKernel
    /**
     * Shorthand to the accessible global kernel object.
     *
     * @type {IKernel}
     * @memberof Global
     */
    k: IKernel
    /**
     * Spawns a new process.
     *
     * @param {string} className
     * @returns {(ProcessId | undefined)}
     * @memberof Global
     */
    launchNew(className: string): ProcessId | undefined
    /**
     * Reboots the kernel.
     *
     * @memberof Global
     */
    reset(): void
    /**
     * Launch the kernel!
     *
     * @memberof Global
     */
    boot(): void
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

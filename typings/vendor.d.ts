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
  }
}

// shim uglify-js for webpack
declare module "uglify-js" {
  export interface MinifyOptions {}
}

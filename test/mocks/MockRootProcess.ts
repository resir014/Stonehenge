// tslint:disable:no-reference
/// <reference path="../../src/core/kernel/kernel.g.d.ts" />
/// <reference path="../../src/core/kernel/processTable.d.ts" />

import { Process } from '../../src/core/kernel'

export class MockRootProcess extends Process<ProcessMemory> {
  public readonly baseHeat: number = 1000
  // private pmem: ProcessMemory

  public run(): ProcessMemory | undefined {
    return
  }
}

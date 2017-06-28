// tslint:disable:no-reference
/// <reference path="../../src/core/kernel/kernel.g.d.ts" />

import { Kernel, ProcessRegistry } from '../../src/core/kernel'
import { MockRootProcess } from '../mocks/MockRootProcess'
import { boot } from '../../src/core/bootstrap'

import * as _ from 'lodash'
import * as chai from 'chai'
declare const global: any
global.Memory = {}
global.Game = {}

const expect = chai.expect
const assert = chai.assert

ProcessRegistry.register(MockRootProcess)

function newKmem(): () => KernelMemory {
  return () => ({
    pmem: {},
    kpar: {
      nextPid: 0,
      isTest: true
    }
  })
}

describe('Kernel', () => {
  it('should have no processes at startup, before loading a table', () => {

    const k = new Kernel(newKmem())
    assert.equal(k.getProcessCount(), 0)
  })

  it('should initialize from blank with a root process', () => {
    const k = new Kernel(newKmem())
    k.loadProcessTable()
    if (k.getProcessCount() === 0) {
      boot(k, MockRootProcess)
    }
    const maybeRootProc = k.getProcessById(0)
    assert.isDefined(maybeRootProc)
    const rootProc = maybeRootProc as IProcess
    expect(rootProc).to.have.property('className', 'MockRootProcess')
  })

  it('should be able to spawn a process', () => {
    const k = new Kernel(newKmem())
    k.spawnProcessByClassName('MockRootProcess')
    const maybeRootProc = k.getProcessById(0)
    assert.isDefined(maybeRootProc)
    const rootProc = maybeRootProc as IProcess
    expect(rootProc).to.have.property('className', 'MockRootProcess')
  })

  it('should be able to kill a process', () => {
    const k = new Kernel(newKmem())
    const pid = k.spawnProcessByClassName('MockRootProcess')!.pid
    assert.equal(k.getProcessCount(), 1)
    k.killProcess(pid)
    assert.equal(k.getProcessCount(), 0)
  })

  it('should reload to the same values', () => {
    const mem = newKmem()
    const k = new Kernel(mem)
    k.spawnProcessByClassName('MockRootProcess')
    k.saveProcessTable()

    const oldMem = _.cloneDeep(mem().proc)

    const k2 = new Kernel(mem)
    k2.loadProcessTable()

    k2.saveProcessTable()
    assert.deepEqual(mem().proc, oldMem)
  })
})

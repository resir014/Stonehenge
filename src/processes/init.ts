import { Kernel } from '../kernel'
import { Process, RegisterProcess } from '../kernel/process'

@RegisterProcess()
class InitProcess extends Process {
  public className: string = this.className

  public static start(roomName: string): void {
    const p = new InitProcess(0, 0)
    Kernel.addProcess(p)
    Kernel.storeProcessTable()

    p.memory.roomName = roomName;
    console.log('New room started:' + roomName);
  }

  public run(): number {
    console.log('main process running...')
    return 0;
  }
}

export default InitProcess

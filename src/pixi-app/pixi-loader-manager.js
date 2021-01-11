/* utils */
import { pipe, filter, uniq } from 'ramda'

class PixiLoaderManager {
  constructor(app) {
    this.app = app
    this.task = []
    this.isLoaderRunning = false
  }
  load(src, callback) {
    const taskId = Symbol('loader-task-id')
    this.task.push({
      id: taskId,
      src,
      callback,
    })
    this.checkTask()
  }
  checkTask() {
    !this.isLoaderRunning && this.runTask()
  }
  runTask() {
    if (!this.task.length) {
      this.isLoaderRunning = false
      return
    }
    this.isLoaderRunning = true
    const currentTask = this.task.pop()
    const needLoadSrc = pipe(
      filter((src) => !this.app.loader.resources[src]),
      uniq
    )(currentTask.src)
    console.log(needLoadSrc)
    if (needLoadSrc.length) {
      this.app.loader.add(needLoadSrc).load(() => {
        currentTask.callback()
        this.runTask()
      })
    } else {
      currentTask.callback()
      this.runTask()
    }
  }
}

export default PixiLoaderManager
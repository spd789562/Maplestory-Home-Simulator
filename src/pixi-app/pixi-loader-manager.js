import { Loader } from 'pixi.js-legacy'

/* utils */
import { pipe, filter, uniq, keys } from 'ramda'
import { entries } from '@utils/ramda'
import getConfig from 'next/config'

const { IMAGE_CDN } = getConfig().publicRuntimeConfig

class PixiLoaderManager {
  constructor(app) {
    this.app = app
    this.task = {}
  }
  load(src, callback) {
    const needLoadSrc = this.getNeedLoadSrc(src)
    if (!needLoadSrc.length) {
      callback()
      return
    }
    const taskId = Symbol('loader-task-id')
    this.task[taskId] = {
      src: needLoadSrc,
      callback,
    }
    this.runTask(taskId)
  }
  reset() {
    keys(this.task).forEach((id) => {
      this.task[id].cancel = true
    })
  }
  getNeedLoadSrc(srcs) {
    return pipe(
      filter((src) => !this.app.loader.resources[src]),
      uniq
    )(srcs)
  }
  addResource(resources) {
    entries(([key, res]) => {
      if (this.app?.loader?.resources && !this.app?.loader?.resources[key]) {
        this.app.loader.resources[key] = res
      }
    }, resources)
  }
  runTask(taskId) {
    const currentTask = this.task[taskId]
    this.task[taskId].loader = new Loader()
    this.task[taskId].loader
      .add(
        currentTask.src.map((url) => ({
          name: url,
          url:
            !url.startsWith('/') || process.env.NODE_ENV === 'development'
              ? url
              : `${IMAGE_CDN}${location.host}${url}`,
        }))
      )
      .load((ld, resources) => {
        this.addResource(resources)
        if (!this.task[taskId].cancel) {
          currentTask.callback()
        }
        delete this.task[taskId]
      })
  }
}

export default PixiLoaderManager

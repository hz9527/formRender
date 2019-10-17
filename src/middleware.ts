import { noop, removeItem } from './utils'

type Handler<I> = (item: I) => I;

export default class Middleware<I, T> {
  globalHandlers: Handler<I>[] = [];
  handlerMap: Map<T, Handler<I>[]> = new Map()
  use (fn: Handler<I>, target: T | T[]): () => void {
    if (typeof fn !== 'function') {
      return noop
    }
    if (Array.isArray(target)) {
      const unsubscribes = target.map((key): () => void => this.use(fn, key))
      return (): void => {
        unsubscribes.forEach((fn): void => fn())
        unsubscribes.length = 0
      }
    }
    let list = target === null ? this.globalHandlers : this.handlerMap.get(target)
    if (list) {
      list.push(fn)
    } else {
      list = [fn]
      this.handlerMap.set(target, list)
    }
    return (): void => {
      removeItem(list, fn)
    }
  }

  run (item: I, target: T, context): I {
    if (!item) {
      return item
    }
    let res = item
    const list = this.globalHandlers.concat(this.handlerMap.get(target) || [])
    for (let i = 0, l = list.length; i < l; i++) {
      res = list[i].call(context, res)
    }
    return res
  }
}

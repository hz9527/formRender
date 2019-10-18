/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetFields, GetFields, PartFields, FormItem as Item } from './types'
import Middleware from './middleware'
interface Fields {
  [s: string]: any;
}

export abstract class ItemRender<F extends Fields, I extends Item> {
  private cache: I;
  private isForce = false;
  children: ItemRender<F, I>[] = null;

  init (middleware: Middleware<ItemRender<F, I>[], Function>): void {
    const children = this.getChildren()
    if (children && children.length) {
      this.children = middleware.run(children, this.constructor, this)
      for (let i = 0, l = this.children.length; i < l; i++) {
        const child = this.children[i]
        const forceUpdate = child.forceUpdate
        child.forceUpdate = (setFields: SetFields<F>, newFields?: PartFields<F>): void => {
          this.isForce = true
          forceUpdate.call(child, setFields, newFields)
        }
        child.init(middleware)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldUpdate (nextFields: F): boolean {
    return true
  }

  forceUpdate (setFields: SetFields<F>, newFields?: PartFields<F>): void {
    this.isForce = true
    setFields(newFields)
  }

  runRender (
    newFeilds: F,
    setFields: SetFields<F>,
    getFields: GetFields<F>,
    middleware: Middleware<I, keyof F>
  ): I {
    if (this.shouldUpdate(newFeilds) || this.cache || this.isForce) {
      this.isForce = false
      let item = this.render(setFields, getFields)
      item = middleware.run(item, (item && item.formId) || null, this)
      if (item.children) {
        this.cache = {
          ...item,
          children: this.children.map(
            (item): I => item.runRender(newFeilds, setFields, getFields, middleware)
          )
          // filter((item): boolean => !!item)
        }
      } else {
        this.cache = item
      }
    }
    return this.cache
  }

  getChildren (): ItemRender<F, I>[] {
    return []
  };

  abstract render(setFields: SetFields<F>, getFields: GetFields<F>): I;
}

export abstract class PureItemRender<F extends Fields, I extends Item> extends ItemRender<F, I> {
  private deps: (keyof F)[];
  private oldProps: (F[keyof F])[] = [];
  constructor (deps?: (keyof F)[]) {
    super()
    this.deps = Array.isArray(deps) ? deps : []
  }

  init (middleware: Middleware<ItemRender<F, I>[], Function>): void {
    super.init(middleware)
    let list = this.deps
    this.children.forEach((item): void => {
      if (item instanceof PureItemRender) {
        list = list.concat((item as PureItemRender<F, I>).deps)
      }
    })
    this.deps = Array.from(new Set(list))
  }

  shouldUpdate (newProps: F): boolean {
    const next = []
    let shouldUpdate = false
    for (let i = 0, l = this.deps.length; i < l; i++) {
      const item = newProps[this.deps[i]]
      next.push(item)
      if (item !== this.oldProps[i]) {
        shouldUpdate = true
      }
    }
    this.oldProps = next
    return shouldUpdate
  }
}

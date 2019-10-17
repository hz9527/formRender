import Middleware from './middleware'
import { ItemRender } from './formItem'
import { walk } from './utils'
import { Effect, FormItem, PartFields } from './types'

interface Middlewares<F, I extends FormItem> {
  item: Middleware<I, keyof F>;
  component: Middleware<ItemRender<F, I>[], Function>;
}

export default abstract class FormRender<F, I extends FormItem> {
  private effect: Effect<I>;
  private fields: F;
  private children: ItemRender<F, I>[] = [];
  private isPending = false;
  private tasks: PartFields<F>[] = [];
  middlewares: Middlewares<F, I>
    = {
      item: new Middleware(),
      component: new Middleware()
    }

  constructor ({ effect }: {effect: Effect<I>}) {
    this.effect = effect
  }

  init (fields: F): I[] {
    this.fields = fields
    const children = this.render()
    this.children = this.middlewares.component.run(children, this.constructor, this)
    this.children.forEach((component): void => {
      component.init(this.middlewares.component)
    })
    const effect = this.effect
    let result: I[]
    this.effect = (items): void => {
      result = items
    }
    result = this.runRender()
    this.effect = effect
    return result
  }

  setFields (part: PartFields<F>): void {
    if (this.isPending) {
      this.tasks.push(part)
    }
    this.fields = {
      ...this.fields,
      ...part
    }
    const children = this.runRender()
    if (this.tasks.length === 0) {
      this.effect(children)
    } else {
      const data = this.tasks.reduce((data, item): PartFields<F> => ({ ...data, ...item }), {})
      this.tasks.length = 0
      this.setFields(data)
    }
  }

  getFields (): F {
    return this.fields
  }

  selectComponents (fn: (item: ItemRender<F, I>) => boolean): ItemRender<F, I>[] {
    const result = []
    const handler = (component: ItemRender<F, I>): void => {
      fn(component) && result.push(component)
      component.children.length && walk(component.children, handler)
    }
    walk(this.children, handler)
    return result
  }

  private runRender (): I[] {
    this.isPending = true
    const result = this.children.map((component): I =>
      component.runRender(this.fields, this.setFields, this.getFields, this.middlewares.item)
    )
    this.isPending = false
    return result
  }

  abstract render(): ItemRender<F, I>[];
}

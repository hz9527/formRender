import Middleware from './middleware'
import {ItemRender} from './formItem'
import { Effect, FormItem } from "./types"

interface Middlewares<F, I extends FormItem> {
  item: Middleware<I, keyof F>;
  component: Middleware<ItemRender<F, I>[], Function>;
}

export default abstract class FormRender<F, I extends FormItem> {
  private effect: Effect<I>;
  private fields: F;
  private children: ItemRender<F, I>[] = [];
  middlewares: Middlewares<F, I>
    = {
      item: new Middleware(),
      component: new Middleware()
    }
  constructor({effect}: {effect: Effect<I>}) {
    this.effect = effect;
  }

  init(fields: F): I[] {
    this.fields = fields;
    const children = this.render();
    this.children = this.middlewares.component.run(children, this.constructor, this);
    this.children.forEach((component): void => {
      component.init(this.middlewares.component)
    });
    return this.runRender();
  }

  setFields(part): void {

  }

  getFields(): F {
    return this.fields;
  }

  private runRender(): I[] {
    return this.children.map((component): I =>
     component.runRender(this.fields, this.setFields, this.getFields, this.middlewares.item)
    )
  }

  abstract render(): ItemRender<F, I>[];
}
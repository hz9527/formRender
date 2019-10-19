## 动机

> 业务上遇到一个持续需求，每个需求即一个表单页面。表单 UI 符合一套设计规范，规划上表单还可能做移动端支持

分析：

1. 表单的 UI 自适应和传统只读数据完全不同，如 选项列表，在 pc 上是 select，在移动端是 picker。
2. 传统只读数据，迁移逻辑类似 ssr，将所有数据放在 store，完成 store 维护即可。
3. 表单 UI 层逻辑较为单一，如 输入框、下拉框基本长得一样

结论：

> 移动端和 PC 展示逻辑可能完全不同，因此需要表单逻辑复用，UI 层只读逻辑层。通过一个抽象中间层来实现表单逻辑，通过 Store 连接到 UI。

流程如下：

表单描述 -》 store -》 MVVM -》onChange(setFeilds,循环上述过程)

## 设计

UI = render(fields)

> 我们知道，大部分情况下表单的重新渲染应该是表单字段变化引起的，表单变化来源于对用户输入的响应

如定义一个 fields：

```js
{
  topic: string,
  date: Moment,
  desc: string,
  selectType: number
}
```

### class

```js
class FormRender<Fields> {

  effect: (items: Item[]) => void; // dispatch

  fields: Fields

  render(): FormItem[] {
    return [
      new FormItem(),
      new FormItem(),
    ]
  }

  setFields(partOfFields: {[S in keyof Fields]?: Fields[P]}): void {}

  getFields(): Fields {}
}

class FormItem {
  render(fields, setFields, getFields): Item {}

  getChildren(): FormItem[] {}
}

// Item 即表单描述，如：
type FormType = 'select' | 'input' | 'date'
interface Item {
  title: string;
  desc: string;
  required: boolean;
  type: FormType;
  value: Fields[keyof Fields];
  onChange(value): void {}; // setFields
}
```

## 优点

1. 可迁移。将表单逻辑和 UI 逻辑分离，pc、移动端基本只需要实现各自表单的 UI，交互逻辑由 render 维护
2. 声明式编程体验。单个输入框逻辑解耦，只读 fields 即可，当表单字段耦合较多时你会发现解除这种声明式编程带来的好处
3. PureItemRender 配合 React shouldUpdate / PureComponent 做到最细化 diff，性能兜底
4. 一个项目多个表单，各个表单独立维护，复用 UI 层，提升开发效率及体验

## quick start

```js
// 比如每次选择开始时间，结束时间自动后推半小时
class StartTime exnteds PureItemRender {
  render(fields, setFields, getFields) {
    return {
      formId: 'start',
      type: 'select',
      value: fields.start,
      options: list // 下拉选项
      onChange(value) {
        setFields({start: value, end: value + 1})
      }
    }
  }
}
class EndTime exnteds PureItemRender {
  render(fields, setFields, getFields) {
    return {
      formId: 'end',
      type: 'select',
      value: fields.end,
      options: list // 下拉选项
      onChange(value) {
        setFields({end: value})
      }
    }
  }
}
class Form extends FormRender {
  render() {
    return [
      new StartTime(['start']),
      new EndTime(['end'])
    ]
  }
}

// 比如下拉选项是异步拉取的
class Select extends PureItemRender {
  options = null;
  render(fields, setFields, getFields) {
    if (!this.options) {
      getOptions()
        .then(data => {
          this.options = data;
          this.forceUpdate(setFields)
        })
    }
    return {
      formId: 'end',
      type: 'select',
      value: fields.select,
      options: this.options // 下拉选项
      loading: !this.options,
      onChange(value) {
        setFields({select: value})
      }
    }
  }
}

// 比如下拉选项只有开关打开才展示
class Select exnteds PureItemRender {
  render(fields, setFields, getFields) {
    return fields.switch ? {
      formId: 'select',
      type: 'select',
      value: fields.select,
      options: list // 下拉选项
      onChange(value) {
        setFields({select: value})
      }
    } : null;
  }
}
class Form extends FormRender {
  render() {
    return [
      new Switch(['switch]),
      new Select(['select', 'switch]),
    ]
  }
}
```

## Api

### FormRender

#### FormRender.constructor

#### FormRender.prototype.render

#### FormRender.prototype.init

#### FormRender.middlewares

#### FormRender.prototype.getFields

#### FormRender.setFields

### PureItemRender

#### PureItemRender.constructor

#### PureItemRender.prototype.render

#### PureItemRender.prototype.forceUpdate

#### PureItemRender.prototype.render

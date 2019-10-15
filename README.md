## 动机

> 业务上遇到一个持续需求，每个需求即一个表单页面。表单 UI 符合一套设计规范，规划上表单还可能做移动端支持

以上背景要求：

1. 由于表单对比传统展示逻辑，移动端和 PC 逻辑可能完全不同，因此需要逻辑服用，UI 层只读逻辑层
2. 对于每一端，UI 复用性很高，每个表单页完全没有必要去拼装 UI 组件，而是一套逻辑的 DSL

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

## Class
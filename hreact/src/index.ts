/* eslint-disable no-void */
type Ele = Text | Element;
interface Props<S> {
  init: S;
  view: (state: S) => VNode | string;
  node: Ele;
}
interface Action<S> extends Function {
  (state: S, ...args: any[]): S;
}
interface Dispatch<S> {
  (state: S): void;
  (action: Action<S>, prop: any): void;
}

interface VNode {
  name: string; // tagName / textValue
  props: {[k: string]: any};
  children: VNode[];
  node: Ele;
  type: number;
  key: any;
}

const EMPTY_OBJ = {}
const EMPTY_ARR = []
const NODE_TYPE = 1
const TEXT_NODE = 3

function createVNode (name, props, children, node, type, key): VNode {
  return { name, props, children, node, type, key }
}

function createTextVNode (text: string, node: Ele): VNode {
  return createVNode(text, EMPTY_OBJ, EMPTY_ARR, node, TEXT_NODE, void 0)
}

function recycleVNode (node: Ele) {
  return node.nodeType === TEXT_NODE
    ? createTextVNode(node.nodeValue, node)
    : createVNode(
      node.nodeName.toLowerCase(),
      EMPTY_OBJ,
      Array.from((node as Element).children).map(n => recycleVNode(n)),
      node,
      NODE_TYPE,
      void 0
    )
}

function getVNode (vnode: VNode | string): VNode {
  return typeof vnode === 'object' ? vnode : createTextVNode(vnode, null)
}

function patchProps () {}

function updateChildren (el: Ele, nKids: VNode[], oKids: VNode[]) {
  let oSInd = 0;
  let nSInd = 0;
  let oEInd = oKids.length - 1;
  let nEInd = nKids.length - 1;
  let oSKid = oKids[0];
  let nSKid = nKids[0];
  let oEKid = oKids[oEInd];
  let nEKid = nKids[nEInd];

  while (oSInd <= oEInd && nSInd <= nEInd) {
    // 不考虑空数组
    if (oSKid.key === nSKid.key) { // 栈
      // update
      oSKid = oKids[++oSInd]
      nSKid = nKids[++nSInd]
    } else if (oEKid.key === nEKid.key) { // 队列
      // update
      oEKid = oKids[++oEInd]
      nEKid = nKids[++nEInd]
    } else if () { // 倒序

    } else { // 假定乱序

    }
  }
}

function createNode (nVdom: VNode, oVdom: VNode): Ele {
  const node = nVdom.type === TEXT_NODE
    ? document.createTextNode(nVdom.name)
    : document.createElement(nVdom.name)
  // todo patchProps
  if (!oVdom) {

  } else {
    updateChildren()
  }
  nVdom.node = node
  return node
}

function patch (parent: Ele, curNode: Ele, oVdom: VNode, nVdom: VNode): Ele {
  if (oVdom === nVdom) {
  } else if (oVdom && oVdom.type === TEXT_NODE && nVdom.type === TEXT_NODE) {
    oVdom.name !== nVdom.name && (curNode.nodeValue = nVdom.name)
  } else if (!oVdom || oVdom.name !== nVdom.name) {
    // create
    curNode = parent.replaceChild(createNode(nVdom, oVdom), curNode)
  } else {
    // todo updateProps
    updateChildren(curNode, nVdom.children, oVdom.children)
  }
  nVdom.node = curNode
  return curNode
}

export function app<S> ({ init, view, node }: Props<S>): void {
  let state: S = {} as S
  let rootNode = node
  let vdom = node && recycleVNode(node)

  function render (): void {
    const old = vdom
    vdom = getVNode(view(state))
    rootNode = patch(rootNode.parentElement, rootNode, old, vdom)
  }

  function setState (newState: S): any {
    if (state !== newState) {
      state = newState
      render()
    }
  }

  const dispatch: Dispatch<S> = function (action: Action<S> | S, prop?: any): void {
    typeof action === 'function' ? dispatch((action as Action<S>)(state, prop)) : setState(action)
  }
  dispatch(init)
}

// hyperapp
// 1. while 新旧头指针移动，如key不等退出，否则更新该节点并头指针右移
// 2. while 新旧尾指针移动，如key不等退出，否则更新该节点并尾指针左移
// 3. 如果 old 遍历完成，while new 头指针右移，并insert节点，直到遍历完成
// 4. 否则如果 new 遍历完成，while old 头指针右移，并remove节点，直到遍历完成
// 5. 否则
//    1）遍历old 头尾指针，创建 old 剩余 keyMap（{key: vnode}）【没给key则不管】
//    2）while new 头尾指针还没重合
//      a） 获取新旧 头指针节点 key
//      b） 如果 new keyMap 有 old key 或 newKey 存在 且 newKey newKey 等于 nextOldKey
//          i oldKey 不存在则移除
//          i old头指针右移继续 while
//      c） 如果 newKey 不存在 或 oldKid 为静态节点
//          i 如果 oldkey 也不存在，则 更新该节点 new 头指针右移
//          i old 头指针右移
//      d） 否则
//          如果newKey === oldKey 更新节点，并标记 new keyMap key标记为true，old头指针右移
//          否则
//            如果 old keyMap 存在 newKey，将 map中节点 插入到当前 oldKid前，并更新，标记 new keyMap
//            否则新建该节点
//          new 头指针右移
//     3）while old 头尾指针还没重合
//          移除不必要节点
//     4）遍历 old keyMap 中 new keyMap 未标记的节点并移除
interface Props<S> {
  init: S;
  view: (state: S) => VNode | string;
  node: Element
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
  props: {[k: string]: any}
  children: VNode[];
  node: Element;
  type: number;
  key: any;
}

type Element = Text | HTMLElement;

const EMPTY_OBJ = {}
const EMPTY_ARR = []
const NODE_TYPE = 1
const TEXT_NODE = 3

function createVNode(name, props, children, node, type, key): VNode {
  return {name, props, children, node, type, key}
}

function createTextVNode(text: string, node: Element): VNode {
  return createVNode(text, EMPTY_OBJ, EMPTY_ARR, node, TEXT_NODE, void 0)
}

function recycleVNode(node: Element) {
  return node.nodeType === TEXT_NODE
    ? createTextVNode(node.nodeValue, node)
    : createVNode(
      node.nodeName.toLowerCase(),
      EMPTY_OBJ,
      Array.from(node.children).map(n => recycleVNode(n)),
      node,
      NODE_TYPE,
      void 0,
    )
}

function getVNode(vnode: VNode | string): VNode {
  return typeof vnode === 'object' ? vnode : createTextVNode(vnode, null)
}

function updateChildren() {

}

function createNode(nVdom: VNode, oVdom: VNode): Element {
  const node = nVdom.type === TEXT_NODE ? document.createTextNode(nVdom.name) : document.createElement(nVdom.name);
  // todo patchProps
  if (!oVdom) {

  } else {
    updateChildren()
  }
  nVdom.node = node;
  return node;
}

function patch(parent: Element, curNode: Element, oVdom: VNode, nVdom: VNode): Element {
  if (oVdom === nVdom) {
  } else if (oVdom && oVdom.type == TEXT_NODE && nVdom.type === TEXT_NODE) {
    oVdom.name !== nVdom.name && (curNode.nodeValue = nVdom.name)
  } else if (!oVdom || oVdom.name !== nVdom.name) {
    // create
    curNode = parent.replaceChild(createNode(nVdom, oVdom), curNode)
  } else {
    // todo updateProps
    updateChildren()
  }
  nVdom.node = curNode;
  return curNode;
}

export function app<S>({init, view, node}: Props<S>): void {
  let state: S = {} as S;
  let rootNode = node;
  let vdom = node && recycleVNode(node);

  function setState(newState: S): any {
    if (state !== newState) {
      state = newState;
      render();
    }
  }

  function render(): void {
    const old = vdom;
    vdom = getVNode(view(state));
    rootNode = patch(rootNode.parentElement, rootNode, old, vdom)
  }

  const dispatch: Dispatch<S> = function(action: Action<S> | S, prop?: any): void {
    typeof action === 'function' ? dispatch((action as Action<S>)(state, prop)) : setState(action)
  }
  dispatch(init)
}
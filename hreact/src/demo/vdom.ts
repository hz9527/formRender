import { EMPTY_ARR, EMPTY_OBJ } from './utils'
import { Api, TEXT_TYPE, ELE_TYPE } from './dom'
import { Ele, VNode } from './types'

function createVNode (
  type: number,
  name: string,
  node: Ele,
  children: VNode[] = EMPTY_ARR,
  props: VNode['props'] = EMPTY_OBJ,
  key: VNode['key'] = undefined
): VNode {
  return { type, name, node, props, children, key }
}

function createTextVNode (text: string, node: Ele): VNode {
  return createVNode(TEXT_TYPE, text, node)
}

function createNode (vnode: VNode): Ele {
  const node = Api.createNode(vnode.type, vnode.name)
  // patchProps
  for (let i = 0, l = vnode.children.length; i < l; i++) {
    Api.appendChild((node as Element), createNode(vnode.children[i]))
  }
  return node
}

function updateVNode (oldVNode: VNode, newVNode: VNode): VNode {
  // update props
  // update children
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  updateChildren(oldVNode.children, newVNode.children)
  return newVNode
}

function updateChildren (oldKids: VNode[], newVNode: VNode[]): VNode[] {

}

export function recycleVNode (node: Ele): VNode {
  return node.nodeType === TEXT_TYPE
    ? createTextVNode(node.nodeValue, node)
    : createVNode(
      ELE_TYPE,
      node.nodeName.toLowerCase(),
      node,
      Array.from((node as Element).children).map(n => recycleVNode(n))
    )
}

export function patch (oldVNode: VNode, newVNode: VNode): Ele {
  let el = oldVNode.node
  if (oldVNode === newVNode) {
  } else if (oldVNode.type === TEXT_TYPE && newVNode.type === TEXT_TYPE) {
    oldVNode.name !== newVNode.name && Api.changeText((oldVNode.node as Text), newVNode.name)
  } else if (newVNode.name !== oldVNode.name) {
    newVNode.node = createNode(newVNode) // 复用 children 没意义
    el = Api.replaceNode(newVNode.node, el)
  } else if (!newVNode) {
    Api.remove(el)
    el = null
  } else {
    updateVNode(oldVNode, newVNode)
  }
  return el
}

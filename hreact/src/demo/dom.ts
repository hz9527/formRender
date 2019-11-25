import { Ele } from './types'

export const ELE_TYPE = 1
export const TEXT_TYPE = 3
export const COMMENT_TYPE = 8

export const Api = {
  removeChild (parent: Element, node: Element): Element {
    return parent.removeChild(node)
  },
  appendChild (parent: Element, node: Ele): void {
    return parent.append(node)
  },
  changeText (textNode: Text, text: string): Text {
    textNode.nodeValue = text
    return textNode
  },
  replaceNode (newNode: Ele, oldNode: Ele): Ele {
    return oldNode.parentNode.replaceChild(newNode, oldNode)
  },
  insertBefore (insertNode: Element, node: Element): Element {
    return node.parentNode.insertBefore(insertNode, node)
  },
  createNode (nodeType: number, name: string): Ele {
    switch (nodeType) {
      case TEXT_TYPE:
        return document.createTextNode(name)
      default:
        return document.createElement(name)
    }
  },
  remove (node: Ele): void {
    node.parentNode.removeChild(node)
  }
}

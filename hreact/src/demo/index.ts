import { recycleVNode, patch } from './vdom'
import { Props, Dispatch, Action } from './types'

export function app<S> (props: Props<S>): void {
  let state: S = ({} as S)
  let node = props.node
  let vdom = recycleVNode(node)

  function render (): void {
    const oldVdom = vdom
    vdom = props.view(state)
    node = patch(node, oldVdom, vdom)
  }

  function setState (newState: S): void {
    if (state !== newState) {
      state = newState
      render()
    }
  }

  const dispatch: Dispatch<S> = (action: S | Action<S>, props?) => {
    typeof action === 'function' ? dispatch((action as Action<S>)(state, props)) : setState(action)
  }

  dispatch(props.init)
}

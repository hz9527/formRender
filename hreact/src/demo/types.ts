/* eslint-disable @typescript-eslint/no-explicit-any */
export type Ele = Element | Text;
export interface VNode {
  type: number; // node type
  name: string; // tagname or text
  props: {[s: string]: any};
  node: Ele;
  children: VNode[];
  key: any;
}

export interface Props<S> {
  init: S;
  view: (S) => VNode;
  node: Ele;
}

export interface Action<S> extends Function {
  (state: S, ...args: any[]): S;
}

export interface Dispatch<S> {
  (state: S): void;
  (action: Action<S>, prop: any): void;
}

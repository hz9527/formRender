
export const noop = (): null => null

export function removeItem<I> (list: I[], item: I): void {
  const ind = list.indexOf(item)
  ind > -1 && list.splice(ind, 1)
}

export function walk<I> (items: I[], handler: (item: I) => void): void {
  for (let i = 0, l = items.length; i < l; i++) {
    const component = items[i]
    handler(component)
  }
}

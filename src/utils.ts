export const noop = () => null;

export function removeItem<I> (list: I[], item: I): void {
  const ind = list.indexOf(item);
  ind > -1 && list.splice(ind, 1)
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Effect<I> {
  (items: I[]): void;
}

export type PartFields<F> = {[K in keyof F]?: F[K]}
export type SetFields<F> = (part: PartFields<F>) => void;
export type GetFields<F> = () => F;

export interface FormItem {
  formId: string;
  children?: FormItem[];
  [s: string]: any;
}

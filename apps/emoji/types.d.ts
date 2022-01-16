declare module '*.yaml' {
  const data: any
  export default data
}

declare namespace svelte.JSX {
  interface DOMAttributes<T> {
    onlongpress?: (e: CustomEvent) => void
    onshortpress?: (e: CustomEvent) => void
  }
}

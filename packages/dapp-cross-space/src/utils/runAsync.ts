const runAsync = (func: VoidFunction) =>
  (globalThis?.queueMicrotask || globalThis?.setTimeout)(func)

export default runAsync

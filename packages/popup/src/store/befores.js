const skipIf = (args, testFn) => ({
  ...args,
  deps: testFn(args.get()) ? null : args.deps,
})

export const skipIfLocked = args => skipIf(args, s => s.locked.lockedData)
export const skipIfNoGroup = args =>
  skipIf(args, s => s.group.groupData?.length === 0)

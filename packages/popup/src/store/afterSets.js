export const setHdGroupAccount = (rst, get, set) => {
  const group = get().group
  const hdGroup = group.groupData.filter(group => group.vault.type === 'hd')

  group.groupHdData = hdGroup
  set({group})
}

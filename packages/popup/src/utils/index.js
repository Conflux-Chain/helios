const getAuth = (hasAccount, isLocked) => {
  if (typeof hasAccount !== 'boolean' || typeof isLocked !== 'boolean') {
    return null
  }
  if (hasAccount && isLocked) {
    return '/unlock'
  }

  if (!hasAccount) {
    return '/welcome'
  }
  return null
}

export {getAuth}

export function hasLineWithOrderedPhrases(message, phrases) {
  return message.split(/[\r\n\u2028\u2029]/).some(line => {
    let start = 0

    for (const phrase of phrases) {
      const index = line.indexOf(phrase, start)
      if (index === -1) return false
      start = index + phrase.length
    }

    return true
  })
}

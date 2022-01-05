// github api doc https://octokit.github.io/rest.js/v18#repos-delete-release
module.exports = async ({github, context}) => {
  const {
    repo: {owner, repo},
  } = context
  const nextver = process.env.NEXT_VERSION
  const tags = await github.repos.listTags({owner, repo})
  const re = new RegExp(`v${nextver}-rc\.`)

  const nextrc =
    tags.reduce((nextrc, {name}) => {
      if (!re.test(name)) return nextrc
      const rc = parseInt(name.replace(re, ''), 10)
      if (!rc) return nextrc
      return Math.max(nextrc, rc)
    }, 0) + 1

  return `${nextver}-rc.${nextrc}`
}

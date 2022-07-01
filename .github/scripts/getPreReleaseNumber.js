// github api doc https://octokit.github.io/rest.js/v18#repos-list-tags
module.exports = async ({github, context}) => {
  const {
    repo: {owner, repo},
  } = context
  const nextver = process.env.NEXT_VERSION
  let tags = await github.rest.repos.listTags({owner, repo})
  tags = (tags && tags.data) || []
  const re = new RegExp(`v${nextver}-rc\.`)

  const nextrc =
    tags.reduce((nextrc, {name}) => {
      if (!re.test(name)) return nextrc
      const rc = parseInt(name.replace(re, ''), 10)
      if (!rc) return nextrc
      return Math.max(nextrc, rc)
    }, 0) + 1

  return {
    version: `${nextver}-rc.${nextrc}`,
    tag: `v${nextver}-rc.${nextrc}`,
    prod_version: `${nextver}`,
    prod_tag: `v${nextver}`,
  }
}

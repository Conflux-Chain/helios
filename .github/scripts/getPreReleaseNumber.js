/* eslint-env es2020 */

module.exports = async ({github, context}) => {
  const {
    repo: {owner, repo},
  } = context
  const nextVersion = process.env.NEXT_VERSION
  const tagPrefix = `v${nextVersion}-rc.`
  const tags = await github.paginate(github.rest.repos.listTags, {
    owner,
    repo,
    per_page: 100,
  })

  let latestRc = 0n
  for (const {name} of tags) {
    if (!name.startsWith(tagPrefix)) continue
    const suffix = name.slice(tagPrefix.length)
    if (!/^\d+$/.test(suffix)) continue

    const rc = BigInt(suffix)
    if (rc > latestRc) latestRc = rc
  }
  const version = `${nextVersion}-rc.${latestRc + 1n}`

  return {
    version,
    tag: `v${version}`,
    prod_version: `${nextVersion}`,
    prod_tag: `v${nextVersion}`,
  }
}

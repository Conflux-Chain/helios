/*
 * delete old debug release, perserve the latest 20
 * old means published old than 90 days ago
 */
module.exports = async ({github, context}) => {
  const {
    repo: {owner, repo},
  } = context
  let releases = await github.rest.repos.listReleases({
    owner,
    repo,
    per_page: 100,
  })
  if (!releases || !releases.data) throw new Error('Github api is broken')
  releases = releases.data
  const debugReleases = releases.filter(
    ({tag_name, prerelease}) => prerelease && tag_name.startsWith('DEBUG-'),
  )

  // preserve latest 20 release
  if (debugReleases.length <= 20) return

  const oldTime = new Date().getTime() - 90 * 24 * 60 * 60 * 1000
  const oldDebugRelease = debugReleases
    .slice(20)
    .reduce((acc, {published_at, id, tag_name}) => {
      if (new Date(published_at).getTime() < oldTime) acc.push([id, tag_name])
      return acc
    }, [])

  console.log(`Found ${oldDebugRelease.length} release to delete`)
  oldDebugRelease.forEach(([_, tag]) => console.log(`- ${tag}`))

  return await Promise.all(
    oldDebugRelease.map(([release_id, tag]) =>
      github.rest.repos
        .deleteRelease({owner, repo, release_id})
        .then(github.rest.git.deleteRef({owner, repo, ref: `tags/${tag}`})),
    ),
  ).catch(console.error)
}

// github api doc https://octokit.github.io/rest.js/v18#repos-delete-release
module.exports = async ({github, context}) => {
  const {
    repo: {owner, repo},
  } = context
  const prnum = process.env.PR_NUMBER
  const releases = await github.rest.repos.listReleases({
    owner,
    repo,
    per_page: 100,
  })
  if (!releases || !releases.data) throw new Error('Github api is broken')
  const [release] = releases.data.filter(
    ({name}) => name === `Debug Release for PR`,
  )

  if (!release) {
    console.log('Debug releases ------------------->')
    console.log('releases.data', releases.data)
    throw new Error(`Can't find the release of ${prnum}`)
  }

  // sort assets, lastest created comes first
  return {...release, assets: release.assets.sort((a, b) => b.id - a.id)}
}

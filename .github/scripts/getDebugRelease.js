// github api doc https://octokit.github.io/rest.js/v18#repos-delete-release
module.exports = async ({github, context}) => {
  const {
    repo: {owner, repo},
  } = context
  const head = process.env.GITHUB_HEAD_REF
  const releases = await github.repos.listReleases({owner, repo, per_page: 30})
  if (!releases || !releases.data) throw new Error('Github api is broken')
  const [release] = releases.data.filter(
    ({tag_name}) => tag_name === `DEBUG-${head}`,
  )

  if (!release) {
    console.log('Debug releases ------------------->')
    console.log('process.env.GITHUB_HEAD_REF = ', process.env.GITHUB_HEAD_REF)
    console.log('releases.data', releases.data)
    throw new Error(`Can't find the release of ${head}`)
  }

  // sort assets, lastest created comes first
  return {...release, assets: release.assets.sort((a, b) => b.id - a.id)}
}

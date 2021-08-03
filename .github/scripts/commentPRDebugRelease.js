module.exports = async ({github, context, release}) => {
  const {
    issue: {number: issue_number},
    repo: {owner, repo},
  } = context
  const {html_url, assets} = release
  const [asset] = assets
  return await github.issues.createComment({
    issue_number,
    owner,
    repo,
    body: `
[Debug release for this PR](${html_url})
Build of this PR:
- [${asset.name}](${asset.browser_download_url})`,
  })
}

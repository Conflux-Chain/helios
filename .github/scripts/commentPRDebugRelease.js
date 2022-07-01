module.exports = async ({github, context, release}) => {
  const {
    issue: {number: issue_number},
    repo: {owner, repo},
  } = context
  const {html_url, assets} = release
  const [asset] = assets
  const comments = await github.rest.issues.listComments({
    owner,
    repo,
    issue_number,
  })

  try {
    // find the latest right comments to update
    const commentToUpdate =
      (comments &&
        comments.data.reduce((acc, {id, body, user: {login}}) => {
          if (login !== 'github-actions[bot]') return acc
          if (
            body &&
            body.startsWith(`
[Debug release for this PR](${html_url})
Build of this PR:
- [`)
          )
            return [id, body]
          return acc
        }, null)) ||
      null

    if (commentToUpdate) {
      const [comment_id, body] = commentToUpdate
      return await github.rest.issues.updateComment({
        owner,
        repo,
        comment_id,
        body: `${body}\n- [${asset.name}](${asset.browser_download_url})`,
      })
    }

    return await github.rest.issues.createComment({
      issue_number,
      owner,
      repo,
      body: `
[Debug release for this PR](${html_url})
Build of this PR:
- [${asset.name}](${asset.browser_download_url})`,
    })
  } catch (err) {
    console.log(err)
    console.log('comments', comments)
  }
}

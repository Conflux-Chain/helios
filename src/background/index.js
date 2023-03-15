import { database } from '../util/database'

// eslint-disable-next-line no-restricted-globals
self.skipWaiting()
console.log('database in bg', database)

const newPost = await database.write(async () => {
  // database.batch
  // table.prepareCreate
  // record.prepareUpdate ...
  const post = await database.get('posts').create((p) => {
    p.title = '帖子'
    p.body = '我是一个帖子'
  })
  const comment = await database.get('comments').create((c) => {
    c.post.set(post)
    c.body = '我是一条评论'
  })
  console.log('comment', comment)
  return post
})

console.log('newPost', newPost)

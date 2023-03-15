/* eslint-disable react/button-has-type */
// import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import React from 'react'

import withObservables from '@nozbe/with-observables'
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider'
// import { useDatabase } from '@nozbe/watermelondb/hooks'
// import { Q } from '@nozbe/watermelondb'

import { createRoot } from 'react-dom/client'
import { database } from '../util/database'

const container = document.getElementById('app-container')
const root = createRoot(container)

function Comment({ comment }) {
  return (
    <div>
      <p>{comment.body}</p>
    </div>
  )
}

const EnhancedComment = withObservables(['comment'], ({ comment }) => ({
  comment,
}))(Comment)

function Post({ post, comments }) {
  console.log('comments', comments, typeof post.createdAt)
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <p>
        <span>发帖时间:</span>
        <span>{post.createdAt.toUTCString()}</span>
      </p>
      <p>
        <span>更新时间:</span>
        <span>{post.updatedAt.toUTCString()}</span>
      </p>
      {comments.length ? <h2>comments</h2> : null}
      {comments.map((comment) => (
        <EnhancedComment key={comment.id} comment={comment} />
      ))}
      <button
        onClick={() => {
          post.changePostTitle()
        }}
      >
        change title
      </button>
    </article>
  )
}

const EnhancedPost = withObservables(['post'], ({ post }) => ({
  post,
  comments: post.comments,
}))(Post)

const usePosts = () => {
  // const database = useDatabase()
  const { value } = useAsync(async () => {
    const res = await database.get('posts').query().fetch()
    // const res2 = await database
    // .get("posts")
    // .query(Q.where("id", "jl34xbkm800tbhvs"));

    // console.log("res2", res2);
    return res
  }, [])
  return value
}

function App() {
  const posts = usePosts() || []

  console.log('posts', posts)
  return (
    <div
      style={{
        height: 200,
        width: 200,
      }}
    >
      <button
        onClick={() => {
          window.open(window.location.href)
        }}
      >
        full screen
      </button>
      <div>
        <p>我是一个新的钱包</p>
        {posts.map((post) => (
          <EnhancedPost post={post} key={post.id} />
        ))}
      </div>
    </div>
  )
}

root.render(
  <DatabaseProvider database={database}>
    <App tab="home" />
  </DatabaseProvider>
)

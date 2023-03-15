import { appSchema, tableSchema, Model, Database } from '@nozbe/watermelondb'

import {
  field,
  text,
  children,
  writer,
  relation,
  readonly,
  date,
} from '@nozbe/watermelondb/decorators'
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

const migrations = schemaMigrations({ migrations: [] })

const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'posts',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string', isOptional: true },
        { name: 'body', type: 'string' },
        { name: 'is_pinned', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'comments',
      columns: [
        { name: 'body', type: 'string' },
        { name: 'post_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
})

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,

  onQuotaExceededError: () => {},
  onSetUpError: () => {},
  extraIncrementalIDBOptions: {},
})

class Post extends Model {
  static table = 'posts'

  static associations = {
    comments: { type: 'has_many', foreignKey: 'post_id' },
  }

  @text('title') title

  @text('body') body

  @field('is_pinned') isPinned

  @readonly @date('created_at') createdAt

  @readonly @date('updated_at') updatedAt

  @children('comments') comments

  @writer async changePostTitle() {
    this.update((post) => {
      post.title = new Date().getTime().toString()
    })
  }
}

class Comment extends Model {
  static table = 'comments'

  static associations = { posts: { type: 'belongs_to', key: 'post_id' } }

  @text('body') body

  @relation('posts', 'post_id') post

  @readonly @date('created_at') createdAt

  @readonly @date('updated_at') updatedAt
}

const database = new Database({ adapter, modelClasses: [Post, Comment] })

// eslint-disable-next-line import/prefer-default-export
export { database }

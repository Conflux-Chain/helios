import {stream, pubsub} from '@thi.ng/rstream'

const s = stream({
  cache: false,
  closeIn: false,
  closeOut: false,
})

const pb = pubsub({
  topic: ({id} = {}) => {
    return id
  },
})
s.subscribe(pb)

export const rpcStream = port => {
  // 把stream.next 传入到外面。方便外面 调用。这里记为方法A
  port.onMessage.addListener(s.next.bind(s))
  return {
    stream: s,
    send(req) {
      const result = new Promise(resolve => {
        // 发送一个请求，其实就是监听请求的id。
        // 当stream.next({id})中的id 被调用的时候。会触发调用下面的next函数
        // next 函数返回一个promise 将返回值在外面可以链式拿到。这里记为B
        pb.subscribeTopic(req.id, {
          next: rst => {
            pb.unsubscribeTopic(req.id)
            if (rst?.result === '__null__') rst.result = null
            resolve(rst)
          },
        })
      })
      // 这里将监听到的request id 发送出去。
      // 如：setupProvider 中 这里就是 向bg 发送消息告诉 bg rq
      // bg 处理完成之后 会告诉 content-script.
      // content-script.会post给 inPage
      // inPage 通过 window.addEventListener 'message' 再调用 方法A 触发 B
      // 完成闭环
      return result
    },
  }
}

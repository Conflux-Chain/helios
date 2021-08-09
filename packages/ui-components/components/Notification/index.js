import Notification from 'rc-notification'
import {Close} from '../../assets/svg'
import {
  ErrorFilled,
  SuccessFilled,
  WarningFilled,
  InfoFilled,
} from '../../assets/svg'

export const NotificationPlacement = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
]

export const IconTypes = ['success', 'info', 'error', 'warning']

const notificationInstance = {}
let defaultDuration = 4.5
let defaultTop = 24
let defaultBottom = 24
let defaultPlacement = 'topRight'
let defaultGetContainer
let defaultCloseIcon

function setNotificationConfig(options) {
  const {duration, placement, bottom, top, getContainer, closeIcon} = options
  if (duration !== undefined) {
    defaultDuration = duration
  }
  if (placement !== undefined) {
    defaultPlacement = placement
  } else {
    defaultPlacement = 'topLeft'
  }
  if (bottom !== undefined) {
    defaultBottom = bottom
  }
  if (top !== undefined) {
    defaultTop = top
  }
  if (getContainer !== undefined) {
    defaultGetContainer = getContainer
  }
  if (closeIcon !== undefined) {
    defaultCloseIcon = closeIcon
  }
}

function getPlacementStyle(
  placement,
  top = defaultTop,
  bottom = defaultBottom,
) {
  let style
  switch (placement) {
    case 'topLeft':
      style = {
        left: 0,
        top,
        bottom: 'auto',
      }
      break
    case 'topRight':
      style = {
        right: 0,
        top,
        bottom: 'auto',
      }
      break
    case 'bottomLeft':
      style = {
        left: 0,
        top: 'auto',
        bottom,
      }
      break
    default:
      style = {
        right: 0,
        top: 'auto',
        bottom,
      }
      break
  }
  return style
}

function getNotificationInstance(args, callback) {
  const {
    placement = defaultPlacement,
    top,
    bottom,
    getContainer = defaultGetContainer,
    closeIcon = defaultCloseIcon,
  } = args
  const prefixCls = 'notification'

  const cacheKey = `${prefixCls}-${placement}`
  const cacheInstance = notificationInstance[cacheKey]
  if (cacheInstance) {
    Promise.resolve(cacheInstance).then(instance => {
      callback({instance})
    })

    return
  }

  const closeIconToRender = (
    <span className="text-gray-60 flex items-center absolute w-4 h-4 top-6 right-6">
      {closeIcon || <Close />}
    </span>
  )

  notificationInstance[cacheKey] = new Promise(resolve => {
    Notification.newInstance(
      {
        prefixCls,
        className: `absolute`,
        style: getPlacementStyle(placement, top, bottom),
        getContainer,
        closeIcon: closeIconToRender,
      },
      notification => {
        resolve(notification)
        callback({
          instance: notification,
        })
      },
    )
  })
}

const typeToIcon = {
  success: <SuccessFilled className="w-6 h-6 mr-4" />,
  info: <InfoFilled className="w-6 h-6 mr-4" />,
  error: <ErrorFilled className="w-6 h-6 mr-4" />,
  warning: <WarningFilled className="w-6 h-6 mr-4" />,
}

function getRCNoticeProps(args) {
  const {
    duration: durationArg,
    icon,
    type,
    content,
    title,
    actions,
    onClose,
    onClick,
    key,
    style = {},
    className = '',
  } = args

  const duration = durationArg === undefined ? defaultDuration : durationArg

  let iconNode = null
  if (icon) {
    iconNode = <span className="w-6 h-6 mr-4">{args.icon}</span>
  } else if (type) {
    iconNode = typeToIcon[type] || null
  }

  return {
    content: (
      <div className="flex" role="alert">
        {iconNode}
        <div className="flex flex-col flex-1">
          <div className="text-gray-80 font-medium text-base pr-6 mb-2">
            {title}
          </div>
          <div className="text-gray-60">{content}</div>
        </div>
        {actions ? <span className="flex justify-end">{actions}</span> : null}
      </div>
    ),
    duration,
    closable: true,
    onClose,
    onClick,
    key,
    style: style || {},
    className: `${className} p-6 shadow-2 rounded w-full md:w-100 mt-4 md:mb-4 md:mr-4 relative animate-move-left bg-gray-0`,
  }
}

function notice(args) {
  getNotificationInstance(args, ({instance}) => {
    instance.notice(getRCNoticeProps(args))
  })
}

const api = {
  open: notice,
  close(key) {
    Object.keys(notificationInstance).forEach(cacheKey =>
      Promise.resolve(notificationInstance[cacheKey]).then(instance => {
        instance.removeNotice(key)
      }),
    )
  },
  config: setNotificationConfig,
  destroy() {
    Object.keys(notificationInstance).forEach(cacheKey => {
      Promise.resolve(notificationInstance[cacheKey]).then(instance => {
        instance.destroy()
      })
      delete notificationInstance[cacheKey] // lgtm[js/missing-await]
    })
  },
}

IconTypes.forEach(type => {
  api[type] = args =>
    api.open({
      ...args,
      type,
    })
})

export default api

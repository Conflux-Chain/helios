import PropTypes from 'prop-types'
import CustomTag from './CustomTag'

function GasFeeCard({
  title,
  action,
  prefix,
  suffix,
  statusTag,
  titleClassName = 'mb-2',
  contentClassName = '',
  children,
}) {
  return (
    <div className="gas-fee-container flex flex-col">
      <header
        className={`gas-fee-header flex items-center justify-between w-full text-gray-40 ${titleClassName}`}
      >
        {title}
        {action}
      </header>

      <div
        className={`gas-fee-body flex items-center bg-gray-4 border-gray-10 rounded px-2 py-3 relative ${contentClassName}`}
        id="gasFeeContainer"
      >
        {prefix && <div className="shrink-0">{prefix}</div>}

        <div className="min-w-0 flex-1 flex flex-col">{children}</div>

        {suffix && <div className="shrink-0">{suffix}</div>}

        {statusTag && (
          <CustomTag
            width="w-auto"
            textColor="text-white"
            backgroundColor="bg-[#44d7b6]"
            className="absolute right-0 top-0 !h-6 px-2"
          >
            {statusTag}
          </CustomTag>
        )}
      </div>
    </div>
  )
}

GasFeeCard.propTypes = {
  title: PropTypes.node,
  action: PropTypes.node,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  statusTag: PropTypes.node,
  titleClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  children: PropTypes.node,
}

export default GasFeeCard

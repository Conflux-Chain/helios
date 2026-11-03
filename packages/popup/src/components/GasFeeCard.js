import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import CustomTag from './CustomTag'
import SwitchButtonGroup from './SwitchButtonGroup'

function GasFeeCard({
  title,
  action,
  prefix,
  suffix,
  statusTag,
  titleClassName = 'mb-2',
  contentClassName = 'items-center px-2 py-3',
  statusTagClassName = 'right-0 top-0 !h-6',
  sponsorshipControl,
  children,
}) {
  const {t} = useTranslation()

  return (
    <div className="gas-fee-container flex flex-col">
      <header
        className={`gas-fee-header flex items-center justify-between text-gray-40 ${titleClassName}`}
      >
        {title}
        {action}
      </header>

      <div
        className={`gas-fee-body relative rounded border-gray-10 bg-gray-4 ${
          sponsorshipControl ? 'border' : ''
        }`}
        id="gasFeeContainer"
      >
        <div
          className={`flex ${contentClassName} ${
            sponsorshipControl ? '!border-0' : 'rounded border-gray-10'
          }`}
        >
          {prefix && <div className="shrink-0">{prefix}</div>}

          <div className="min-w-0 flex-1 flex flex-col">{children}</div>

          {suffix && <div className="shrink-0">{suffix}</div>}

          {statusTag && (
            <CustomTag
              width="w-auto"
              textColor="text-white"
              backgroundColor="bg-[#44d7b6]"
              className={`absolute px-2 ${statusTagClassName}`}
            >
              {statusTag}
            </CustomTag>
          )}
        </div>

        {sponsorshipControl && (
          <div className="flex h-[42px] shrink-0 items-center justify-between border-t border-gray-10 pl-[52px] pr-[10px]">
            <span
              className="text-sm font-normal not-italic text-[#A9ABB2]"
              style={{
                fontFamily:
                  '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {t('gasSponsorship')}
            </span>

            <SwitchButtonGroup
              WrapperId="gas-sponsorship-switch"
              showLeft={!sponsorshipControl.enabled}
              onSwitch={showLeft => sponsorshipControl.onChange(!showLeft)}
              containerClassName="flex h-8 w-8 shrink-0 items-center justify-center"
              leftSwitchClassName="!w-8 !h-8 !text-gray-60"
              rightSwitchClassName="!w-8 !h-8"
            />
          </div>
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
  statusTagClassName: PropTypes.string,
  sponsorshipControl: PropTypes.shape({
    enabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  }),
  children: PropTypes.node,
}

export default GasFeeCard

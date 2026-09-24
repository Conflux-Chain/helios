import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CopyButton} from '../../../components'
import DecodedCallArguments from '../../../components/DecodedCallArguments'
import {useDecodedCall} from '../../../hooks/useDecodedCall'

function CallDataDetails({call, callIndex, network}) {
  const {t} = useTranslation()
  const {to, value, data} = call
  const {decodedCall} = useDecodedCall({
    to,
    data,
    networkType: network.type,
    networkId: network.netId,
  })

  return (
    <li className="rounded bg-gray-4 p-4">
      <h2 className="mb-3 text-sm font-medium text-gray-80">
        {t('callBundleCallTitle', {number: callIndex + 1})}
      </h2>

      <dl className="mb-3 flex flex-col gap-3">
        {Object.entries({to, value}).map(([name, fieldValue]) => (
          <div key={name}>
            <dt className="font-mono text-xs text-gray-40">{name}</dt>
            <dd className="mt-0.5 break-all font-mono text-sm text-gray-80">
              {fieldValue}
            </dd>
          </div>
        ))}
      </dl>

      {decodedCall && (
        <>
          <p className="mb-0.5 text-xs text-gray-40">{t('functionName')}</p>
          <p className="mb-3 break-all text-sm text-gray-80">
            {decodedCall.name}
          </p>
          <DecodedCallArguments
            args={decodedCall.args}
            inputs={decodedCall.functionFragment.inputs}
          />
        </>
      )}

      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-40">{t('hexData')}</p>
        <CopyButton
          text={data}
          className="text-gray-60 hover:text-primary"
          containerClassName="relative shrink-0"
          toastClassName="-top-8 right-0"
        />
      </div>
      <p className="break-all font-mono text-sm text-gray-80">{data}</p>
    </li>
  )
}

function CallBundleDataDetails({
  chainId,
  from,
  atomicRequired,
  calls,
  network,
}) {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded bg-gray-4 p-4">
        <dl className="flex flex-col gap-3">
          {Object.entries({chainId, from, atomicRequired}).map(
            ([name, value]) => (
              <div key={name}>
                <dt className="font-mono text-xs text-gray-40">{name}</dt>
                <dd className="mt-0.5 break-all font-mono text-sm text-gray-80">
                  {String(value)}
                </dd>
              </div>
            ),
          )}
        </dl>
        <p className="mt-3 text-xs text-gray-40">
          {t('callBundleAtomicExecutionDescription')}
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {calls.map((call, callIndex) => (
          <CallDataDetails
            key={callIndex}
            call={call}
            callIndex={callIndex}
            network={network}
          />
        ))}
      </ol>
    </div>
  )
}

CallDataDetails.propTypes = {
  call: PropTypes.object.isRequired,
  callIndex: PropTypes.number.isRequired,
  network: PropTypes.object.isRequired,
}

CallBundleDataDetails.propTypes = {
  chainId: PropTypes.string.isRequired,
  from: PropTypes.string.isRequired,
  atomicRequired: PropTypes.bool.isRequired,
  calls: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
    }),
  ).isRequired,
  network: PropTypes.shape({
    type: PropTypes.string.isRequired,
    netId: PropTypes.number.isRequired,
  }).isRequired,
}

export default CallBundleDataDetails

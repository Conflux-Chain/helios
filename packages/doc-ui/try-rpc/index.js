/* eslint-disable import/no-unresolved */
/* eslint-disable no-empty */
/* global conflux */
import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {useInterval, useBoolean} from 'react-use'
import {useRPC} from '@fluent-wallet/doc-use-rpc'
import {useSpec} from '@fluent-wallet/doc-use-spec'
import JSONInput from 'react-json-editor-ajrm/es'
import locale from 'react-json-editor-ajrm/es/locale/en'

export function UI() {
  const [rpcName, setRpcName] = useState(null)

  useInterval(
    () => {
      if (location && location.hash) {
        setRpcName(location.hash?.substr?.(1))
      }
    },
    rpcName ? null : 100,
  )

  const noRpc = (
    <section>
      <h2>No rpc method provided</h2>
    </section>
  )
  const ui = (
    <section>
      <Try name={rpcName} />
    </section>
  )

  return rpcName ? ui : noRpc
}

function request(payload) {
  return new Promise(resolve => {
    conflux
      ?.request(payload)
      .then(r => {
        resolve({result: r})
      })
      .catch(err => resolve({error: err}))
  })
}

function Try({name}) {
  const {schemas} = useRPC(name)
  const [genedOnce, setGened] = useBoolean(false)
  const [res, setRes] = useState('')
  const {gen, valid, error, data, setData, schema} = useSpec(name, {
    schema: schemas?.input,
  })
  if (gen && !genedOnce) {
    try {
      setData(gen(schema))
    } catch (err) {}
    setGened(true)
  }

  return (
    <div>
      <button
        style={{marginRight: '1rem'}}
        disabled={!valid}
        onClick={() =>
          request({
            method: name,
            params: data,
          }).then(r => {
            if (r.error) setRes(r.error.message)
            else setRes(JSON.stringify(r.result, null, 4))
          })
        }
      >
        Try
      </button>
      <button onClick={() => setData(gen(schema))}>Random</button>
      {!valid && !error && <p>Invalid Data</p>}
      {!valid && error && <p>{`Error in params: \n${error}`}</p>}
      <h4>Params: </h4>
      <JSONInput
        placeholder={data}
        locale={locale}
        onChange={e => setData(e.jsObject)}
      />
      <h4>Response:</h4>
      <textarea
        style={{minWidth: '30rem', minHeight: '10rem'}}
        readOnly
        value={res}
      />
    </div>
  )
}

Try.propTypes = {
  name: PropTypes.string.isRequired,
}

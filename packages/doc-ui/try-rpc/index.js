/* eslint-disable import/no-unresolved */
/* eslint-disable no-empty */
/* global conflux */
import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {useBoolean} from 'react-use'
import {useRPC} from '@fluent-wallet/doc-use-rpc'
import {useSpec} from '@fluent-wallet/doc-use-spec'
import JSONInput from 'react-json-editor-ajrm/es'
import locale from 'react-json-editor-ajrm/es/locale/en'

export function UI({rpcNames}) {
  const [rpcName, setRpcName] = useState('')

  useEffect(() => {
    const updateRpcName = () => setRpcName(window.location.hash.slice(1))
    updateRpcName()
    window.addEventListener('hashchange', updateRpcName)
    return () => window.removeEventListener('hashchange', updateRpcName)
  }, [])

  if (!rpcName || !rpcNames.includes(rpcName)) {
    return (
      <section>
        <h2>{rpcName ? 'Unknown RPC method' : 'No rpc method provided'}</h2>
      </section>
    )
  }

  return (
    <section>
      <Try key={rpcName} name={rpcName} />
    </section>
  )
}

UI.propTypes = {
  rpcNames: PropTypes.arrayOf(PropTypes.string).isRequired,
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

  useEffect(() => {
    if (!gen || !schema || genedOnce) return
    try {
      setData(gen(schema))
    } catch (err) {}
    setGened(true)
  }, [gen, schema, genedOnce, setData, setGened])

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
      <button disabled={!gen || !schema} onClick={() => setData(gen(schema))}>
        Random
      </button>
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

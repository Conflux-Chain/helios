import React from 'react'
import PropTypes from 'prop-types'
import {useRPC} from '@cfxjs/doc-use-rpc'
import {useSpec} from '@cfxjs/doc-use-spec'

const Var = 'var'

const renderParams = (rpcName, {children, ...params}, path = [0]) => {
  const {k} = params
  if (children?.length) {
    return (
      <Param
        key={k || path}
        hasChildren
        rpcName={rpcName}
        {...params}
        path={path}
      >
        {children.map((c, idx) =>
          renderParams(rpcName, {...c, parentK: k}, [...path, idx]),
        )}
      </Param>
    )
  }

  return (
    <Param
      key={k || path}
      hasChildren={false}
      rpcName={rpcName}
      path={path}
      {...params}
    />
  )
}

export const Parameters = ({parameters, rpcName}) => {
  let params = parameters
  const {schemas} = useRPC(rpcName)
  const {doc} = useSpec(rpcName, {schema: schemas?.input})
  params = doc || params

  return (
    <section className="parameters">
      <h4>Parameters</h4>
      <form id={`rpc-form-${rpcName}`}>
        <table>
          <caption>
            {`Parameters of RPC method `}
            <Var>{rpcName}</Var>
          </caption>
          <tbody>{renderParams(rpcName, params)}</tbody>
        </table>
      </form>
    </section>
  )
}

const Doc = ({doc}) => <p>{doc}</p>
const Type = ({type}) => <Var>{type}</Var>
const DataEntry = ({htmlElement, rpcName, id, onChange, value}) => {
  const Tag = htmlElement?.el || 'input'
  const otherProps = {}
  if (Tag === 'select') {
    // eslint-disable-next-line testing-library/no-node-access
    console.log(htmlElement.values)
    otherProps.children = htmlElement.values.map((v, idx) => (
      <option key={idx} value={v}>
        {'' + v}
      </option>
    ))
  }

  if (htmlElement?.type === 'checkbox') {
    otherProps.checked = value
  } else {
    otherProps.value = value
  }

  return (
    <Tag
      id={id}
      onChange={onChange}
      form={`rpc-form-${rpcName}`}
      type={htmlElement?.type || 'text'}
      {...otherProps}
    />
  )
}

const Validator = ({valid, error, empty}) => {
  return <p>{empty ? 'Empty' : valid ? 'Valid!' : error}</p>
}

const obj = <Var>object</Var>

const ParamWithChildren = ({type, children, rpcName, k, kv, path}) => {
  const legendOpts = {
    cat: 'array of',
    or: 'one of',
    and: 'all of',
    map: <>{obj} with keys</>,
    '?': 'array with zero or one',
    '*': 'array with zero or more item as described',
    '+': 'array with one or more as described',
  }
  const entryId = `${rpcName}-${kv && k}-entry`
  const mapKey = (
    <label htmlFor={entryId}>
      <Var>{k}</Var>
    </label>
  )

  return (
    <tr className="paramwithchildren">
      {path.length > 1 && <td>{k || path[path.length - 1]}</td>}
      <td>
        <fieldset>
          <legend>
            {kv && (
              <>
                {mapKey} {`: `} {legendOpts[type]}
              </>
            )}
            {!kv && legendOpts[type]}
          </legend>
          <table>
            {/* <caption>caption</caption> */}
            <tbody>{children}</tbody>
          </table>
        </fieldset>
      </td>
    </tr>
  )
}

const TypeToHideValidation = ['checkbox', 'radio']
const ElementToHideValidation = ['select']

const ChildParam = ({kv, parentK, value, rpcName, k, path}) => {
  const pathId = (k || parentK || '') + '-' + path.join('-')
  const entryId = `${rpcName}-${pathId}-entry`
  const name = <Var>{k || path[path.length - 1]}</Var>
  const {setData, data, valid, error, gen} = useSpec(entryId, {
    schema: value?.schema,
  })
  const hideValidation =
    TypeToHideValidation.includes(value?.htmlElement?.type) ||
    ElementToHideValidation.includes(value?.htmlElement?.el)

  return (
    <tr className="childparam">
      <td>
        {kv && <Var>{k}</Var>}
        {!kv && <Var>{path[path.length - 1]}</Var>}
      </td>
      <td>
        <fieldset>
          <legend>
            <label htmlFor={entryId}>{name}</label>
          </legend>
          <table>
            {/* <caption>caption</caption> */}
            <tbody>
              <tr key="type">
                <td>Type</td>
                <td>
                  <Type {...value} />
                </td>
              </tr>
              <tr key="doc">
                <td>Doc</td>
                <td>
                  <Doc {...value} />
                </td>
              </tr>
              <tr key="data-entry">
                <td>Entry</td>
                <td>
                  <DataEntry
                    onChange={e => {
                      if (e.target.type === 'checkbox')
                        setData(e.target.checked)
                      else setData(e.target.value)
                    }}
                    value={data === null ? '' : data}
                    rpcName={rpcName}
                    id={entryId}
                    {...value}
                  />
                </td>
              </tr>
              {!hideValidation && (
                <tr key="validator">
                  <td>Validation</td>
                  <td>
                    <Validator
                      empty={data === null || data === ''}
                      valid={valid ?? true}
                      error={error ?? []}
                      {...value}
                    />
                  </td>
                </tr>
              )}
              {!hideValidation && (
                <tr key="generator">
                  <td>Random data</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        if (!gen || !value?.schema) return
                        let generated = gen(value?.schema)
                        if (
                          Array.isArray(generated) ||
                          typeof generated === 'object'
                        )
                          try {
                            generated = JSON.stringify(generated)
                          } catch (err) {} // eslint-disable-line no-empty
                        setData(generated)
                      }}
                    >
                      fill
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </fieldset>
      </td>
    </tr>
  )
}

const Param = ({hasChildren, ...props}) => {
  if (hasChildren) return <ParamWithChildren {...props} />
  return <ChildParam {...props} />
}

Doc.propTypes = {
  doc: PropTypes.string.isRequired,
}
Type.propTypes = {
  type: PropTypes.string.isRequired,
}
DataEntry.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  rpcName: PropTypes.string.isRequired,
  htmlElement: PropTypes.shape({
    el: PropTypes.string,
    type: PropTypes.string,
    values: PropTypes.array,
  }),
}
DataEntry.defaulProps = {
  htmlElement: {
    el: 'input',
    type: 'text',
    values: undefined,
  },
}
Parameters.propTypes = {
  parameters: PropTypes.object.isRequired,
  rpcName: PropTypes.string.isRequired,
}
Param.propTypes = {
  hasChildren: PropTypes.bool.isRequired,
}
ChildParam.propTypes = {
  rpcName: PropTypes.string.isRequired,
  path: PropTypes.arrayOf(PropTypes.number).isRequired,
  k: PropTypes.string,
  kv: PropTypes.bool,
  parentK: PropTypes.string,
  value: PropTypes.object.isRequired,
}
ChildParam.defaultProps = {
  k: undefined,
  kv: undefined,
  parentK: undefined,
}
ParamWithChildren.propTypes = {
  path: PropTypes.arrayOf(PropTypes.number).isRequired,
  k: PropTypes.string,
  kv: PropTypes.bool,
  rpcName: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['map', 'or', 'and', 'cat', '+', '*', '?', 'alt'])
    .isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
ParamWithChildren.defaultProps = {
  k: undefined,
  kv: undefined,
  parentK: undefined,
}
Validator.propTypes = {
  valid: PropTypes.bool.isRequired,
  error: PropTypes.array.isRequired,
  empty: PropTypes.bool.isRequired,
}

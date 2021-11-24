/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React from 'react'
import PropTypes from 'prop-types'
import {useRPC} from '@fluent-wallet/doc-use-rpc'
import {useSpec} from '@fluent-wallet/doc-use-spec'
import {useToggle} from 'react-use'

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

const Toggle = ({title, children}) => {
  const [visible, toggle] = useToggle(false)
  return (
    <div style={{border: '1px solid gray', padding: '8px'}}>
      <div
        role="button"
        onClick={toggle}
        style={{cursor: 'pointer', display: 'flex', flexDirection: 'row'}}
      >
        <div
          style={{
            transform: visible ? 'rotate(0deg)' : 'rotate(270deg)',
            marginRight: '0.5rem',
          }}
        >
          🔽{' '}
        </div>
        <div>{title}</div>
      </div>
      <div
        style={{
          display: visible ? 'block' : 'none',
          margin: '1rem',
        }}
      >
        {children}
      </div>
    </div>
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
      {renderParams(rpcName, params)}
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

const ParamWithChildren = ({type, children, rpcName, k, kv, path, value}) => {
  const legendOpts = {
    maybe: 'optional',
    cat: 'array of',
    or: 'one of',
    and: 'all of',
    map: <>{obj} with keys</>,
    catn: 'array item with below schema',
    '?': 'zero or one',
    '*': 'zero or more',
    '+': 'one or more',
  }
  const entryId = `${rpcName}-${kv && k}-entry`
  const mapKey = (
    <label htmlFor={entryId}>
      <Var>{k}</Var>
      {value?.optional && '(optional)'}
    </label>
  )

  let toggleTitle = ''
  if (kv) {
    toggleTitle = (
      <>
        {mapKey} {`: `} {legendOpts[type]}
      </>
    )
  } else if (legendOpts[type]) {
    toggleTitle = legendOpts[type]
  }

  if (value?.optional) toggleTitle += ' (optional)'

  return (
    <Toggle
      title={toggleTitle}
      className="paramwithchildren"
      level={path?.length || 1}
    >
      {/* {path.length > 1 && (k || path[path.length - 1])} */}
      {children}
    </Toggle>
  )
}

// const TypeToHideValidation = ['checkbox', 'radio']
// const ElementToHideValidation = ['select']

const ChildParam = ({
  kv,
  value,
  k, // parentK, rpcName, path
}) => {
  // const pathId = (k || parentK || '') + '-' + path.join('-')
  // const entryId = `${rpcName}-${pathId}-entry`
  // const name = <Var>{value?.catnk || k || path[path.length - 1]}</Var>
  // const {setData, data, valid, error, gen} = useSpec(entryId, {
  //   schema: value?.schema,
  // })
  // const hideValidation =
  //   TypeToHideValidation.includes(value?.htmlElement?.type) ||
  //   ElementToHideValidation.includes(value?.htmlElement?.el)

  return (
    <div className="childparam">
      {kv && <Var>{k}</Var>}
      {/* {!kv && <Var>{path[path.length - 1]}</Var>} */}
      {/*   <label htmlFor={entryId}>{name}</label> */}
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
          {value?.optional && (
            <tr key="optional">
              <td>Optional</td>
              <td>true</td>
            </tr>
          )}
          {/* <tr key="data-entry"> */}
          {/*   <td>Entry</td> */}
          {/*   <td> */}
          {/*     <DataEntry */}
          {/*       onChange={e => { */}
          {/*         if (e.target.type === 'checkbox') */}
          {/*           setData(e.target.checked) */}
          {/*         else setData(e.target.value) */}
          {/*       }} */}
          {/*       value={data === null ? '' : data} */}
          {/*       rpcName={rpcName} */}
          {/*       id={entryId} */}
          {/*       {...value} */}
          {/*     /> */}
          {/*   </td> */}
          {/* </tr> */}
          {/* {!hideValidation && ( */}
          {/*   <tr key="validator"> */}
          {/*     <td>Validation</td> */}
          {/*     <td> */}
          {/*       <Validator */}
          {/*         empty={data === null || data === ''} */}
          {/*         valid={valid ?? true} */}
          {/*         error={error ?? []} */}
          {/*         {...value} */}
          {/*       /> */}
          {/*     </td> */}
          {/*   </tr> */}
          {/* )} */}
          {/* {!hideValidation && ( */}
          {/*   <tr key="generator"> */}
          {/*     <td>Random data</td> */}
          {/*     <td> */}
          {/*       <button */}
          {/*         type="button" */}
          {/*         onClick={() => { */}
          {/*           if (!gen || !value?.schema) return */}
          {/*           let generated = gen(value?.schema) */}
          {/*           if ( */}
          {/*             Array.isArray(generated) || */}
          {/*             typeof generated === 'object' */}
          {/*           ) */}
          {/*             try { */}
          {/*               generated = JSON.stringify(generated) */}
          {/*             } catch (err) {} // eslint-disable-line no-empty */}
          {/*           setData(generated) */}
          {/*         }} */}
          {/*       > */}
          {/*         Random */}
          {/*       </button> */}
          {/*     </td> */}
          {/*   </tr> */}
          {/* )} */}
        </tbody>
      </table>
    </div>
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
  type: PropTypes.oneOf([
    'map',
    'or',
    'and',
    'cat',
    'catn',
    '+',
    '*',
    '?',
    'alt',
    'maybe',
  ]).isRequired,
  value: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
ParamWithChildren.defaultProps = {
  value: undefined,
  k: undefined,
  kv: undefined,
  parentK: undefined,
}
Validator.propTypes = {
  valid: PropTypes.bool.isRequired,
  error: PropTypes.array.isRequired,
  empty: PropTypes.bool.isRequired,
}
Toggle.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
}

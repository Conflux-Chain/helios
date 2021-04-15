import {useEffect} from 'react'
import create from 'zustand'

let SPEC = null
const Stores = {}

const createSpec = id =>
  create((set, get) => ({
    _id: id,
    _retryCount: 0,
    cantLoadSpec: null,
    loadingSpec: true,
    schema: null,
    doc: null,
    data: null,
    spec: SPEC,
    error: null,
    valid: null,
    validating: false,

    setData: data => (set({data}), get().validate()),
    isLoading: () => get().loadingSpec,

    validate: () => {
      const s = get()
      if (
        s.loadingSpec ||
        !s.schema ||
        s.data === null ||
        s.data === 'undefined' ||
        s.data === ''
      )
        return null
      set({validating: true})
      const valid = s.spec.validate(s.schema, s.data)
      set({valid, validating: false})
      s.setError()
      return valid
    },
    setDoc: () => {
      const s = get()
      if (!s.spec?.generateDocumentation || !s.schema) return
      const doc = s.spec.generateDocumentation(s.schema)
      set({doc})
      return doc
    },
    setError: () => {
      const s = get()
      if (s.validating || s.valid === null || s.valid) return null
      let error = s.spec.explain(s.schema, s.data)
      if (!Array.isArray(error)) error = [error]
      set({error})
      return error
    },
    setSchema: schema => (set({schema}), get().validate(), get().setDoc()),
    setSpec: () => {
      const {spec, setDoc, validate} = get()
      if (spec) {
        validate()
        setDoc()
        return
      }

      window &&
        import('@cfxjs/spec/src/doc.js')
          .then(spec => {
            SPEC = spec
            set({spec, loadingSpec: false})
          })
          .then(() => get().validate())
          .then(() => get().setDoc())
          .catch(err => {
            const {_retryCount, setSpec} = get()
            if (_retryCount < 5) {
              set(({_retryCount}) => ({_retryCount: _retryCount + 1}))
              setSpec()
              return
            }

            console.error(err)
            set({cantLoadSpec: err})
          })
    },
  }))

export const useSpec = (id, {schema, data} = {}) => {
  if (!id) throw new Error(`invalid spec id: ${id}`)

  const isNewSpec = !Stores[id]
  if (isNewSpec) Stores[id] = createSpec(id)

  const useStore = Stores[id]
  const s = useStore()

  useEffect(() => {
    if (schema) s.setSchema(schema)
  }, [schema])

  useEffect(() => {
    if (data) s.setData(data)
  }, [data])

  useEffect(() => {
    if (isNewSpec) s.setSpec()
  }, [isNewSpec])

  return s
}

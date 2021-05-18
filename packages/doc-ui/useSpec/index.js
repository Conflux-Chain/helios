import {useEffect} from 'react'
import create from 'zustand'

let SPEC = null
let GEN = null
const Stores = {}

const createSpec = id =>
  create((set, get) => ({
    _id: id,
    _specRetryCount: 0,
    _genRetryCount: 0,
    cantLoadSpec: null,
    cantLoadGen: null,
    loadingSpec: true,
    loadingGen: true,
    schema: null,
    doc: null,
    parsedData: null,
    data: null,
    spec: SPEC,
    gen: GEN,
    error: null,
    valid: null,
    validating: false,

    setData: data => {
      let parsedData
      try {
        // spec like arr/cat may accept arr as input, so we need to parse user
        // input with JSON.parse
        parsedData = JSON.parse(data)
      } catch (err) {} // eslint-disable-line no-empty
      if (parsedData !== undefined) set({parsedData})
      else set({parsedData: data})
      set({data})
      get().validate()
    },
    isLoading: () => get().loadingSpec,

    validate: async () => {
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
      let valid = await s.spec.validate(s.schema, s.parsedData)
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
    setError: async () => {
      const s = get()
      if (s.validating || s.valid === null || s.valid) return null
      let error = await s.spec.explain(s.schema, s.parsedData)
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
            const {_specRetryCount, setSpec} = get()
            if (_specRetryCount < 5) {
              set(({_specRetryCount}) => ({
                _specRetryCount: _specRetryCount + 1,
              }))
              setSpec()
              return
            }

            console.error(err)
            set({cantLoadSpec: err})
          })
    },
    setGen: () => {
      const {gen} = get()
      if (gen) return

      window &&
        import('@cfxjs/spec/src/gen.js')
          .then(({gen}) => {
            GEN = gen
            set({gen, loadingGen: false})
          })
          .catch(err => {
            const {_genRetryCount, setGen} = get()
            if (_genRetryCount < 5) {
              set(({_genRetryCount}) => ({_genRetryCount: _genRetryCount + 1}))
              setGen()
              return
            }

            console.error(err)
            set({cantLoadGen: err})
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
    if (isNewSpec) {
      s.setSpec()
      s.setGen()
    }
  }, [isNewSpec])

  return s
}

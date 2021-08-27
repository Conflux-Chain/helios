import {skipIfLocked} from './befores.js'

// used to config get only rpc methods
export const RPC_CONFIG = [
  // with this locked config, we can get:
  //
  // const {getLocked, locked: {lockedData, lockedError, lockedLoading, lockedMutate}} = useStore()
  //
  // `getLocked` is the actual useRPC hook useStore used under the hood
  // `lockedData` is the result of calling wallet_isLocked rpc method
  // `lockedError` is the error of calling the rpc method
  // the naming of these variables are controlled by the `key` value
  //
  // eg.
  // if we set key to foo here, we get:
  // const {foo: {fooData, fooError, fooLoading, fooMutate}} = useStore()
  {method: 'wallet_isLocked', key: 'locked'},
  {
    method: 'wallet_getAccountGroup',
    key: 'group',
    // the default value of the data, default to undefined
    init: [],
    // before are fns[] runs before sending rpc request with swr
    // it's used to refactor the args goes into swr
    // check the implementation to see how it works
    //
    // eg. here we use it to skip the call when wallet is locked
    //
    // const {get, set, deps, params, opts} = args
    //
    // get/set is the fn from zustand store
    //
    // deps/params/opts is the params to be called by swr
    /// deps by default will be the rpc method ("wallet_getAccountGroup" here)
    /// deps will be null when calling useStore with deps: null
    /// deps will be a array when calling deps with any other arguments
    /// deps is undefined by default
    //
    // params is the rpc method params, undefined by default
    //
    // opts is the opts for swr, undefined by default
    before: [skipIfLocked],

    // afterGet are fns[] runs after swr and before writing state to store
    // if afterGet return false, the hook won't write state to store
    // check the implementation to see how it works

    // afterSet is one fn that can only be used for side effects
  },
]

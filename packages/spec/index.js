import spec from './src/spec'
export default spec
import {create as createAccount} from '@cfxjs/account'

export const {
  hexAddress,
  hexAccountAddress,
  hexContractAddress,
} = spec.defRestSchemas({createAccount})

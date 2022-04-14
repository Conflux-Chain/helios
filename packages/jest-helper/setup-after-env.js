import '@testing-library/jest-dom'
import crypto from 'crypto'
import TextEncoding from 'text-encoding'

window.nodejsCrypto = crypto
window.crypto = crypto.webcrypto
window.TextDecoder = TextEncoding.TextDecoder

export const FUNGIBLE_TOKEN_ABI = [
  'function balanceOf(address tokenHolder) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
  'function allowance(address holder, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function granularity() view returns (uint256)',
  'function send(address recipient, uint256 amount, bytes data)',
  'function transferFrom(address holder, address recipient, uint256 amount) returns (bool)',
]

export const TOKEN_CALL_ABI = [
  ...FUNGIBLE_TOKEN_ABI,
  'function setApprovalForAll(address operator, bool approved)',
  'function safeTransferFrom(address from, address to, uint256 tokenId) payable',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) payable',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
]

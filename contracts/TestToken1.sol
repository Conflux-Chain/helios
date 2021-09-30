// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import './oz/contracts/token/ERC20/ERC20.sol';

contract TestToken1 is ERC20 {
    constructor() ERC20('Test Token 1', 'test1') {
        // CFX_ACCOUNTS 0,1,2
        _mint(0x1B3d01a14C84181F4DF3983Ae68118e4BAD48407, 0x8ac7230489e80000);
        _mint(0x168539313a4a03211Ee03f5F9A6c149751fb4f44, 0x8ac7230489e80000);
        _mint(0x1Bb3720c8323cfb8FEfdbdB9229872ED34EF9b57, 0x8ac7230489e80000);

        // ETH_ACCOUNTS 0,1,2
        _mint(0x1dE7fb621A141182bF6E65bEABC6e8705CdfF3D1, 0x8ac7230489e80000);
        _mint(0x28B19b15AbD3B20C71C7c808403AB934f2fd9Cb1, 0x8ac7230489e80000);
        _mint(0x65E4e03771F45EB921520631419f8C56533Cf931, 0x8ac7230489e80000);

        // deploy this with GENESIS_PRI_KEY
        // pk 0x46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f
        // address 0xfbe45681Ac6C53D5a40475F7526baC1FE7590fb8
        // address 0x1be45681ac6c53d5a40475f7526bac1fe7590fb8
    }
}

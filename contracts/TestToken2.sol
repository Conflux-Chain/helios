// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import './oz/contracts/token/ERC20/ERC20.sol';

contract TestToken2 is ERC20 {
    constructor() ERC20('Test Token 2', 'test2') {
        // CFX_ACCOUNTS 0,1,2
        _mint(0x1B3d01a14C84181F4DF3983Ae68118e4BAD48407, 0x56bc75e2d63100000);
        _mint(0x168539313a4a03211Ee03f5F9A6c149751fb4f44, 0x56bc75e2d63100000);
        _mint(0x1Bb3720c8323cfb8FEfdbdB9229872ED34EF9b57, 0x56bc75e2d63100000);

        // ETH_ACCOUNTS 0,1,2
        _mint(0x1dE7fb621A141182bF6E65bEABC6e8705CdfF3D1, 0x56bc75e2d63100000);
        _mint(0x28B19b15AbD3B20C71C7c808403AB934f2fd9Cb1, 0x56bc75e2d63100000);
        _mint(0x65E4e03771F45EB921520631419f8C56533Cf931, 0x56bc75e2d63100000);

        // deploy this with CFX_ACCOUNTS[9]
        // pk 0xc13af00b42e30c3e878a20852996078b83011b89a20194fd4db566d1e3a7001e
        // address 0xd465709d8195fff311333fc454b5e792ddc4ba12
        // address 0x1465709d8195fff311333fc454b5e792ddc4ba12
    }
}

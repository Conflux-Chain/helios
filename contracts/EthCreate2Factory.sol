// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract ETHCreate2Factory {
    event Deployed(address addr, uint256 salt);

    function deploy(bytes memory code, uint256 salt) public returns (address) {
        address addr;
        assembly {
            addr := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        emit Deployed(addr, salt);
        return addr;
    }

    function computeAddress(bytes memory code, uint256 salt)
        public
        view
        returns (address)
    {
        uint8 prefix = 0xff;
        bytes32 initCodeHash = keccak256(abi.encodePacked(code));
        bytes32 hash = keccak256(
            abi.encodePacked(prefix, address(this), salt, initCodeHash)
        );
        return address(uint160(uint256(hash)));
    }
}

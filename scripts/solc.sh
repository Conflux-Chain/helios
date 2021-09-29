#!/usr/bin/env bash

solc --abi --bin -o ./packages/test-helpers/contracts/ --overwrite ./contracts/TestToken1.sol
solc --abi --bin -o ./packages/test-helpers/contracts/ --overwrite ./contracts/TestToken2.sol
solc --abi --bin -o ./packages/test-helpers/contracts/ --overwrite ./contracts/cfx/contracts/utils/Create2Factory.sol
solc --abi --bin -o ./contracts/compiled --overwrite ./contracts/cfx/contracts/utils/Create2Factory.sol
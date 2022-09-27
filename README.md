## Getting Started
Description: 
This repo contains a smart contract (Akyllers.sol) for the creation and transactions of Non Fungible Tokens between several addresses.
I created 31 unit tests to try breaking some features of the smart contract in order to check that the contract is safe to deploy on the blockchain.
Examples of unit tests I ran were:
 -making sure that the amount of tokens minted does not exceed the maximum supply of tokens set in the contract
 -making sure that an address cannot mint a token while the public phase has not yet started
 -making sure that the amount of tokens minted by a single address does not exceed the limit of minting per address
 -setting a custom base URI
 -allowing an address to withdraw Eth from 

## Running the unit tests
1-Open a terminal window and run the following line:
run ganache-cli --allowUnlimitedContractSize 

2-Open the folder in VSCode, create a new terminal and run the following line:
truffle test

After some time you should the results of the tests logged in the terminal.

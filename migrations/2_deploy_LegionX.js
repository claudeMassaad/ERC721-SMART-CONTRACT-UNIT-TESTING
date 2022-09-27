let url = "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/";
let ad = "0xc7fd16B33d144064932FC22c22c6EA6bFB1C0063";
let ad1 = "0x5C889c17AFd9E8FabC112C7Ca7bF3E2D9e943aaa";
let accounts = [ad, ad1];
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

whitelistAddresses = accounts;
const leafNodes = whitelistAddresses.map((addr) => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

// 4. Get root hash of the `merkleeTree` in hexadecimal format (0x)
const rootHash = merkleTree.getRoot();

const claimingAddress = leafNodes[0];

// `getHexProof` returns the neighbour leaf and all parent nodes hashes that will
// be required to derive the Merkle Trees root hash.
const hexProof = merkleTree.getHexProof(claimingAddress);

//get MarkelROOT IN BYTES32
const rootHashBytes32 = "0x" + merkleTree.getRoot().toString("hex");
var Akyllers = artifacts.require("./Akyllers");
module.exports = function (deployer) {
  deployer.deploy(
    Akyllers,
    "Mynft",
    "nft",
    2,
    3,
    33,
    rootHashBytes32,
    "i",
    url
  );
}; // Additional contracts can be deployed here

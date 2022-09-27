// Title : uinttest for smartcontract(Akyllers)
//BY ENG: Claude Massaad

//note : must run ganache-cli --allowUnlimitedContractSize in a separate terminal

// GET smartcontract artifacts ,necessary library
const akyllers = artifacts.require("Akyllers.sol");
const utils = require("./helper");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

contract("Akyllers", (accounts) => {
  // get accounts from ganache-cli by truffle::
  //alice ,bob :cryptographic couple (by example)
  let [alice, bob, x, y] = accounts;
  // 2. Collect list of wallet addresses from competition, ganache_cli, etc....
  whitelistAddresses = [alice, bob, x, y];

  // 3. Create a new array of `leafNodes` by hashing all indexes of the `whitelistAddresses`
  // using `keccak256`. Then creates a Merkle Tree object using keccak256 as the algorithm.
  //
  // The leaves, merkleTree, and rootHas are all PRE-DETERMINED prior to whitelist claim
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
  // image json url
  let url = "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/";

  let contractInstance;

  beforeEach(async () => {
    //JavaScript object that will act as an instance of the contract.
    contractInstance = await akyllers.new(
      "Mynft",
      "nft",
      2,
      3,
      33,
      rootHashBytes32,
      "i",
      url,
      { from: alice }
    );

    // string memory _Name,
    // string memory _Symbol,
    // uint256 _cost,
    // uint256 _maxperaddress,
    // uint256 _supplyLimit,
    // bytes32 _merkleRoot,
    // string memory _obscurumUri,
    // string memory _extension
  });

  //check if the contract deployed
  it("Contract deployment", function () {
    return akyllers.deployed().then(function (instance) {
      contractInstance = instance;

      assert(
        contractInstance !== undefined,
        "akyllers contract should be defined"
      );
    });
  });

  //test for presalemint proces
  context("Pre sale mint scenario", async () => {
    it("should able to presalemint", async () => {
      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });

      await contractInstance.Presalemint(1, hexProof, { value: 2 });
    });

    it("should not allow to presalemint,cause : The public sale has started !", async () => {
      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });

      await utils.shouldThrow(
        contractInstance.Presalemint(1, rootHashBytes32, { value: 2 })
      );
    });

    it("should not allow to presalemint,cause : wallet limit exceeded  !", async () => {
      await contractInstance.setPaused(true, { from: alice });
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });

      await utils.shouldThrow(
        contractInstance.Presalemint(5, rootHashBytes32, { value: 2 })
      );
    });

    it("should not allow to presalemint,cause : Invalid proof!  !", async () => {
      await contractInstance.setPaused(true, { from: alice });
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });

      await utils.shouldThrow(contractInstance.Presalemint(2, 0, { value: 2 }));
    });

    it("should not allow  to presalemint , cause: Invalid mint amount ,smaller than zero !", async () => {
      await contractInstance.setPaused(true, { from: alice });
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });

      await utils.shouldThrow(
        contractInstance.Presalemint(-7, rootHashBytes32, { value: 2 })
      );
    });

    it("should not allow  to presalemint , cause: Max supply exceeded ! ", async () => {
      await contractInstance.setPaused(true, { from: alice });
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });

      await utils.shouldThrow(
        contractInstance.Presalemint(34, rootHashBytes32, { value: 2 })
      );
    });

    it("should not allow  to mint , cause: Incorrect amount : no value sent with Tx ! ", async () => {
      await contractInstance.setPaused(true, { from: alice });
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });

      await utils.shouldThrow(contractInstance.Presalemint(1, rootHashBytes32));
    });
  });

  //test for mint process
  context(" mint scenario", async () => {
    it("should able to mint", async () => {
      await contractInstance.setPublicSalePhase(3, 2, { from: alice });
      await contractInstance.setPaused(false, { from: alice });

      await contractInstance.mint(1, { value: 2, from: alice });
    });

    it("should not allow  to mint , cause: public sale not active yet!", async () => {
      await contractInstance.setPaused(true, { from: alice });

      await utils.shouldThrow(
        contractInstance.mint(1, { value: 2, from: alice })
      );
    });

    it("should not allow  to mint , cause: Invalid mint amount ,smaller than zero !", async () => {
      await contractInstance.setPaused(false, { from: alice });

      await utils.shouldThrow(
        contractInstance.mint(-2, { value: 2, from: alice })
      );
    });

    it("should not allow  to mint , cause: Max supply exceeded ! ", async () => {
      await contractInstance.setPaused(false, { from: alice });

      await utils.shouldThrow(
        contractInstance.mint(34, { value: 2, from: alice })
      );
    });

    it("should not allow  to mint , cause: Incorrect amount : no value sent with Tx ! ", async () => {
      await contractInstance.setPaused(false, { from: alice });

      await utils.shouldThrow(contractInstance.mint(34, { from: alice }));
    });
  });

  //test for airdrop
  context("Airdrop scenario", async () => {
    it("should able to start airdrop", async () => {
      await contractInstance.Airdrop([1], [bob]);
    });

    it("should not allow Airdrop , cause : Max supply exceeded!", async () => {
      await utils.shouldThrow(contractInstance.Airdrop(50, bob));
    });
  });

  //test for walletOfOwner function
  context("walletOfOwner and mint scenario", async () => {
    it("should get walletOfOwner without mint", async () => {
      result = await contractInstance.walletOfOwner(alice);
      assert.equal(result, 0, "error");
    });

    it("should get walletOfOwner after 1 mint process ", async () => {
      await contractInstance.setPublicSalePhase(3, 2, { from: alice });

      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.mint(1, { value: 2, from: alice });
      result = await contractInstance.walletOfOwner(alice);

      assert.equal(result.toString(), 1, "comparison error");
    });

    it("should get walletOfOwner after several mint process ", async () => {
      await contractInstance.setPublicSalePhase(3, 2, { from: alice });
      await contractInstance.setMaxPerAddress(10);
      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.mint(1, { value: 2, from: alice });
      await contractInstance.mint(2, { value: 4, from: alice });
      await contractInstance.mint(1, { value: 2, from: alice });
      await contractInstance.mint(2, { value: 4, from: alice });
      result = await contractInstance.walletOfOwner(alice);

      assert.equal(
        result.toString(),
        [1, 2, 3, 4, 5, 6].toString(),
        "comparison error"
      );
    });
  });

  //test for tokenurl
  context("tokenURI scenario", async () => {
    it("should get tokenURI ", async () => {
      await contractInstance.setPublicSalePhase(3, 2, { from: alice });

      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.mint(1, { value: 2, from: alice });
      result = await contractInstance.tokenURI(1);

      assert.equal(result, "i", "comparison error");
    });

    it("should not allow to get nonexistent tokenURI ,cause : URI query for nonexistent token", async () => {
      await contractInstance.setPublicSalePhase(3, 2, { from: alice });

      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.mint(1, { value: 2, from: alice });

      await utils.shouldThrow(contractInstance.tokenURI(2));
    });
  });

  //test for set value process
  context("set scenario", async () => {
    it("should be able to set a cost", async () => {
      await contractInstance.setCost(2, { from: alice });
      result = await contractInstance.cost();
      //expect(result.receipt.status).to.equal(true);
      console.log(result);
      assert.equal(result, 2, `unable to set  ${result}`);
    });

    it("should be able to set a Revealed to true", async () => {
      await contractInstance.reveal(true, { from: alice });
      result = await contractInstance.revealed();
      assert.equal(result, true, "set failed");
    });

    it("should be able to set a HiddenMetadataUri ", async () => {
      await contractInstance.setHiddenMetadataUri("sdf", { from: alice });
      result = await contractInstance.obscurumuri();

      assert.equal(result, "sdf", "unable to set HiddenMetadataUri");
    });

    it("should be able to set BaseUrl", async () => {
      await contractInstance.setUri(url, { from: alice });
      result = await contractInstance.baseUri();

      assert.equal(
        result,
        "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/",
        "unalbe to set Base Url,must be equal "
      );
    });

    it("should be able to set Paused to true", async () => {
      await contractInstance.setPaused(true, { from: alice });
      result = await contractInstance.paused();

      assert.equal(result, true, "unable to set Paused");
    });

    it("should be able to set MerkelROOT ", async () => {
      await contractInstance.setMerkleRoot(rootHashBytes32, { from: alice });
      result = await contractInstance.merkleRoot();

      assert.equal(
        result,
        rootHashBytes32.toString(),
        "unable to set markelRoot"
      );
    });
  });

  //test for setStartingIndex
  context("setStartingIndex scenario", async () => {
    it("should able to set StartingIndex,", async () => {
      await contractInstance.setStartingIndex();
    });

    it("should not allow  StartingIndex,cause: Starting index is already set", async () => {
      await contractInstance.setStartingIndex();

      await utils.shouldThrow(contractInstance.setStartingIndex());
    });
  });

  //test for withdrawEth
  context("withdrawEth scenario", async () => {
    it("should able to withdrawEth", async () => {
      await contractInstance.setPublicSalePhase(3, 2, { from: alice });

      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.mint(1, { value: 2, from: alice });
      await contractInstance.mint(1, { value: 2, from: bob });

      await contractInstance.withdrawEth({ from: alice });
    });

    it("should not allow to withdrawEth,cause : no permission", async () => {
      await contractInstance.setPublicSalePhase(3, 2, { from: alice });

      await contractInstance.setPaused(false, { from: alice });
      await contractInstance.mint(1, { value: 2, from: alice });
      await contractInstance.mint(1, { value: 2, from: bob });

      await utils.shouldThrow(
        contractInstance.withdrawEth(alice, { from: bob })
      );
    });

    it("should not allow to withdrawEth,cause : account is not due payment", async () => {
      await contractInstance.setPaused(false, { from: alice });

      await utils.shouldThrow(
        contractInstance.withdrawEth(bob, { from: alice })
      );
    });
  });
});

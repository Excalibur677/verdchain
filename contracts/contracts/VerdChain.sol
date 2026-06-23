// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VerdChain is ERC1155, AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    uint256 public nextBatchId = 1;

    struct CarbonBatch {
        uint256 batchId;
        string gpsLat;
        string gpsLon;
        uint256 tonnes;
        uint256 timestamp;
        string arweaveHash;
        string vintage;
        bool retired;
        address retiredBy;
        string retirementReason;
    }

    mapping(uint256 => CarbonBatch) public batches;
    uint256[] public allBatchIds;

    // DAO treasury splits
    address public guardianPool;
    address public ecosystemFund;
    address public insurancePool;

    event CarbonMinted(
        uint256 indexed batchId,
        string gpsLat,
        string gpsLon,
        uint256 tonnes,
        string arweaveHash,
        string vintage,
        uint256 timestamp
    );

    event CarbonRetired(
        uint256 indexed batchId,
        address indexed retiredBy,
        uint256 tonnes,
        string retirementReason,
        uint256 timestamp
    );

    event MerkleRootStored(
        uint256 indexed batchId,
        bytes32 merkleRoot,
        uint256 timestamp
    );

    mapping(uint256 => bytes32) public batchMerkleRoots;

    constructor(
        address _guardianPool,
        address _ecosystemFund,
        address _insurancePool
    ) ERC1155("https://verdchain.io/api/token/{id}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        guardianPool = _guardianPool;
        ecosystemFund = _ecosystemFund;
        insurancePool = _insurancePool;
    }

    function mint(
        address to,
        string memory gpsLat,
        string memory gpsLon,
        uint256 tonnes,
        string memory arweaveHash,
        string memory vintage
    ) external onlyRole(ORACLE_ROLE) {
        uint256 batchId = nextBatchId++;

        batches[batchId] = CarbonBatch({
            batchId: batchId,
            gpsLat: gpsLat,
            gpsLon: gpsLon,
            tonnes: tonnes,
            timestamp: block.timestamp,
            arweaveHash: arweaveHash,
            vintage: vintage,
            retired: false,
            retiredBy: address(0),
            retirementReason: ""
        });

        allBatchIds.push(batchId);
        _mint(to, batchId, tonnes, "");

        emit CarbonMinted(
            batchId,
            gpsLat,
            gpsLon,
            tonnes,
            arweaveHash,
            vintage,
            block.timestamp
        );
    }

    function retire(
        uint256 batchId,
        string memory retirementReason
    ) external {
        require(balanceOf(msg.sender, batchId) > 0, "No tokens to retire");
        require(!batches[batchId].retired, "Already retired");

        uint256 amount = balanceOf(msg.sender, batchId);
        batches[batchId].retired = true;
        batches[batchId].retiredBy = msg.sender;
        batches[batchId].retirementReason = retirementReason;

        _burn(msg.sender, batchId, amount);

        emit CarbonRetired(
            batchId,
            msg.sender,
            amount,
            retirementReason,
            block.timestamp
        );
    }

    function storeMerkleRoot(
        uint256 batchId,
        bytes32 merkleRoot
    ) external onlyRole(ORACLE_ROLE) {
        batchMerkleRoots[batchId] = merkleRoot;
        emit MerkleRootStored(batchId, merkleRoot, block.timestamp);
    }

    function getAllBatchIds() external view returns (uint256[] memory) {
        return allBatchIds;
    }

    function getBatch(uint256 batchId) external view returns (CarbonBatch memory) {
        return batches[batchId];
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol"; // Add this for on-chain JSON encoding
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol"; // For string conversion

contract HederaHakathon is ERC721, ERC721Pausable, Ownable {
    uint256 private _nextTokenId;

    // Struct to store on-chain metadata per token
    struct Achievement {
        string goalDescription;
        string userInfo; // e.g., "username: alice123"
        uint256 completionTimestamp;
    }

    // Mapping tokenId => Achievement
    mapping(uint256 => Achievement) public achievements;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string goalDescription, string userInfo);

    constructor(address initialOwner)
        ERC721("HederaHakathonAchievement", "GLT")
        Ownable(initialOwner)
    {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Updated mint: Accept params for on-chain storage
    function safeMint(
        address to,
        string memory goalDescription,
        string memory userInfo,
        uint256 completionTimestamp 
    ) public onlyOwner returns (uint256) {
        require(bytes(goalDescription).length > 0, "Goal description required");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        // Store on-chain
        achievements[tokenId] = Achievement({
            goalDescription: goalDescription,
            userInfo: userInfo,
            completionTimestamp: completionTimestamp
        });

        emit NFTMinted(to, tokenId, goalDescription, userInfo);
        return tokenId;
    }

    // Override tokenURI to return on-chain JSON metadata (no IPFS)
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId); // Check existence

        Achievement memory ach = achievements[tokenId];

        // Build JSON
        string memory json = string(abi.encodePacked(
            '{"name": "Goal Achievement #', Strings.toString(tokenId), '",',
            '"description": "', ach.goalDescription, '",',
            '"attributes": [',
                '{"trait_type": "User Info", "value": "', ach.userInfo, '"},',
                '{"trait_type": "Completion Date", "value": "', Strings.toString(ach.completionTimestamp), '"}',
            ']}'
        ));

        // Base64 encode
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}
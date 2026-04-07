// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    // 1. Define states for the product journey
    enum Status { Created, InTransit, Delivered }

    // 2. Define what a 'Product' looks like
    struct Product {
        uint256 id;
        string name;
        string companyName;
        address currentOwner;
        Status status;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    // Events help the website "listen" to what's happening on the blockchain
    event ProductRegistered(uint256 id, string name, string companyName, address owner);
    event StatusChanged(uint256 id, Status newStatus);

    // Function for a company to list/register a new good
    function registerProduct(string memory _name, string memory _company) public {
        productCount++;
        products[productCount] = Product(
            productCount, 
            _name, 
            _company, 
            msg.sender, 
            Status.Created, 
            block.timestamp
        );
        emit ProductRegistered(productCount, _name, _company, msg.sender);
    }

    // Function to update status (Moving from Manufacturer to Retailer)
    function updateStatus(uint256 _id, Status _newStatus) public {
        require(msg.sender == products[_id].currentOwner, "Only the owner can update this");
        products[_id].status = _newStatus;
        emit StatusChanged(_id, _newStatus);
    }
}
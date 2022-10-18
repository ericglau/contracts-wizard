import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyToken", function () {
  it("Should return token name", async function () {
    const MyToken = await ethers.getContractFactory("MyToken");

    const instance = await MyToken.deploy();
    await instance.deployed();

    expect(await instance.name()).to.equal("MyToken"); // based on user provided contract name
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { HederaHakathon } from "../typechain-types";

describe("HederaHakathon", function () {
  let hederaHakathon: HederaHakathon;
  let owner: any;
  let addr1: any;
  let addr2: any;

  const sampleDescription = "Complete React Advanced Course";
  const sampleUserInfo = "John-Doe-FrontendEngineer";
  const sampleTimestamp = 1_700_000_000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const HederaHakathonFactory = await ethers.getContractFactory(
      "HederaHakathon",
    );
    hederaHakathon = (await HederaHakathonFactory.deploy(
      owner.address,
    )) as HederaHakathon;
    await hederaHakathon.waitForDeployment();
  });

  describe("Deployment", function () {
    it("sets the right owner", async function () {
      expect(await hederaHakathon.owner()).to.equal(owner.address);
    });

    it("has correct name and symbol", async function () {
      expect(await hederaHakathon.name()).to.equal(
        "HederaHakathonAchievement",
      );
      expect(await hederaHakathon.symbol()).to.equal("GLT");
    });
  });

  describe("Minting with metadata", function () {
    it("allows owner to mint with full achievement metadata", async function () {
      const tx = await hederaHakathon.safeMint(
        addr1.address,
        sampleDescription,
        sampleUserInfo,
        sampleTimestamp,
      );

      await expect(tx)
        .to.emit(hederaHakathon, "NFTMinted")
        .withArgs(addr1.address, 0, sampleDescription, sampleUserInfo);

      expect(await hederaHakathon.ownerOf(0)).to.equal(addr1.address);
      expect(await hederaHakathon.balanceOf(addr1.address)).to.equal(1);

      const achievement = await hederaHakathon.achievements(0);
      expect(achievement.goalDescription).to.equal(sampleDescription);
      expect(achievement.userInfo).to.equal(sampleUserInfo);
      expect(achievement.completionTimestamp).to.equal(sampleTimestamp);
    });

    it("increments tokenId correctly for multiple mints", async function () {
      await hederaHakathon.safeMint(
        addr1.address,
        sampleDescription,
        sampleUserInfo,
        sampleTimestamp,
      );
      await hederaHakathon.safeMint(
        addr2.address,
        "Another goal",
        "Alice-Dev",
        sampleTimestamp + 1,
      );
      await hederaHakathon.safeMint(
        owner.address,
        "Third goal",
        "Owner-Role",
        sampleTimestamp + 2,
      );

      expect(await hederaHakathon.ownerOf(0)).to.equal(addr1.address);
      expect(await hederaHakathon.ownerOf(1)).to.equal(addr2.address);
      expect(await hederaHakathon.ownerOf(2)).to.equal(owner.address);

      const ach0 = await hederaHakathon.achievements(0);
      const ach1 = await hederaHakathon.achievements(1);
      const ach2 = await hederaHakathon.achievements(2);

      expect(ach0.goalDescription).to.equal(sampleDescription);
      expect(ach1.goalDescription).to.equal("Another goal");
      expect(ach2.goalDescription).to.equal("Third goal");
    });

    it("reverts if non-owner tries to mint", async function () {
      await expect(
        hederaHakathon
          .connect(addr1)
          .safeMint(
            addr1.address,
            sampleDescription,
            sampleUserInfo,
            sampleTimestamp,
          ),
      ).to.be.revertedWithCustomError(
        hederaHakathon,
        "OwnableUnauthorizedAccount",
      );
    });

    it("reverts if goalDescription is empty", async function () {
      await expect(
        hederaHakathon.safeMint(
          addr1.address,
          "",
          sampleUserInfo,
          sampleTimestamp,
        ),
      ).to.be.revertedWith("Goal description required");
    });
  });

  describe("Pause / Unpause", function () {
    it("allows owner to pause and unpause", async function () {
      await hederaHakathon.pause();
      expect(await hederaHakathon.paused()).to.equal(true);

      await hederaHakathon.unpause();
      expect(await hederaHakathon.paused()).to.equal(false);
    });

    it("prevents minting when paused", async function () {
      await hederaHakathon.pause();

      await expect(
        hederaHakathon.safeMint(
          addr1.address,
          sampleDescription,
          sampleUserInfo,
          sampleTimestamp,
        ),
      ).to.be.revertedWithCustomError(hederaHakathon, "EnforcedPause");
    });

    it("prevents transfers when paused", async function () {
      await hederaHakathon.safeMint(
        addr1.address,
        sampleDescription,
        sampleUserInfo,
        sampleTimestamp,
      );

      await hederaHakathon.pause();

      await expect(
        hederaHakathon
          .connect(addr1)
          .transferFrom(addr1.address, addr2.address, 0),
      ).to.be.revertedWithCustomError(hederaHakathon, "EnforcedPause");
    });
  });

  describe("tokenURI", function () {
    it("returns a valid base64-encoded JSON with achievement data", async function () {
      await hederaHakathon.safeMint(
        addr1.address,
        sampleDescription,
        sampleUserInfo,
        sampleTimestamp,
      );

      const uri = await hederaHakathon.tokenURI(0);
      expect(uri).to.be.a("string");
      expect(uri.startsWith("data:application/json;base64,")).to.equal(true);

      const base64 = uri.replace("data:application/json;base64,", "");
      const jsonStr = Buffer.from(base64, "base64").toString("utf8");
      const parsed = JSON.parse(jsonStr);

      expect(parsed.name).to.equal("Goal Achievement #0");
      expect(parsed.description).to.equal(sampleDescription);
      expect(parsed.attributes).to.be.an("array");

      const userInfoAttr = parsed.attributes.find(
        (attr: any) => attr.trait_type === "User Info",
      );
      const completionAttr = parsed.attributes.find(
        (attr: any) => attr.trait_type === "Completion Date",
      );

      expect(userInfoAttr.value).to.equal(sampleUserInfo);
      expect(completionAttr.value).to.equal(sampleTimestamp.toString());
    });
  });
}


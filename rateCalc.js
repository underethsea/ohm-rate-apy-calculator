import { ethers } from "ethers";

// change this array to reflect differed desired APYs
let desiredAPY = [50000, 75000, 85000, 100000, 150000, 200000, 267588];
const endpointURL = "https://arb1.arbitrum.io/rpc";
const umamiToken = "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3";
const umamiStakingContract = "0xc9ecFeF2fac1E38b951B8C5f59294a8366Dfbd81";

const apyToApr = (interest, frequency) =>
  ((1 + interest / 100) ** (1 / frequency) - 1) * frequency * 100;

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var customHttpProvider = new ethers.providers.JsonRpcProvider(endpointURL);

// umami token ABI
const tokenABI = [
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

async function calc() {
  let umamiContract = await new ethers.Contract(
    umamiToken,
    tokenABI,
    customHttpProvider
  );
  // umami total supply
  let totalSupply = await umamiContract.totalSupply();
  let totalSupplyParse = ethers.utils.formatUnits(totalSupply, "gwei");
  // get staking balance
  let stakedBalance = await umamiContract.balanceOf(umamiStakingContract);
  stakedBalance = ethers.utils.formatUnits(stakedBalance, "gwei");
  console.log("total supply: ", totalSupplyParse, " UMAMI");
  console.log("total staked: ", stakedBalance, "UMAMI");
  
  for (let q of desiredAPY) {
    // get apr for q APY
    let apr = apyToApr(q, 365 * 3);
    // calculate rewards based on desired apr and total amount staked
    let rewards = ((apr / 100) * (stakedBalance * 1000000000)) / (365 * 3);
    // calculate info _rate based on rewards and total supply
    let rate = (rewards / 1000) / totalSupplyParse;
    console.log(
      numberWithCommas(q),
      "% apy requires ",
      parseInt(rewards),
      " UMAMI rewards per epoch | _rate = ",
      parseInt(rate)
    );
  }
}
calc();

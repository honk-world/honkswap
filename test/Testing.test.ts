// import { prepare, deploy, getBigNumber, createSLP } from "./utilities"
// import { ethers } from "hardhat";

// describe("MyTests", function () {


//   describe("exportMathStuff", function () {
//     it("show the result", async function () {

//       const overrides = {
//         gasLimit: 9500000
//       }

//       const sushiAmount = "1000000000000000";
//       const WETHAmount = "1000000000000000";

//       const CalHashCont = await ethers.getContractFactory("CalHash")
//       const calHash = await CalHashCont.deploy();
//       await calHash.deployed();
//       console.log(await calHash.getInitHash())

//       await this.sushi.approve(this.router.address, sushiAmount);

//       const tx = await this.router.addLiquidityETH(
//         this.sushi.address, 
//         sushiAmount, 
//         sushiAmount, 
//         WETHAmount, 
//         this.alice.address, 
//         MaxUint256, 
//         {
//           ...overrides,
//           value: WETHAmount
//         }
//       )

//       const receipt = await tx.wait()
//       //console.log(receipt)
//       // console.log(receipt.events[0].args.desc)
//       for (const ev of receipt.events) {
//         console.log(ev?.args?.id.toString() + " " + ev?.args?.date.toString())  
//       }
//     })
//   })
// })
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
      const escrows = JSON.parse(localStorage.getItem("escrows")) || [];
      // console.log(escrows);
      setEscrows(escrows);
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById("beneficiary").value;
    const arbiter = document.getElementById("arbiter").value;
    const value = ethers.utils.parseEther(document.getElementById("eth").value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: (value / ethers.utils.parseEther("1")).toString() + " ETH",
      approved: false,
      handleApprove: async () => {
        escrowContract.on("Approved", () => {
          document.getElementById(escrowContract.address).className = "complete";
          document.getElementById(escrowContract.address).innerText = "✓ It's been approved!";
          escrow.approved = true;
          // localStorage.setItem("escrows", JSON.stringify([...escrows, escrow]));
        });

        await approve(escrowContract, signer);
        const escrowsOld = JSON.parse(localStorage.getItem("escrows")) || [];
        localStorage.setItem("escrows", JSON.stringify([...escrowsOld, escrow]));
      },
    };

    setEscrows([...escrows, escrow]);
    localStorage.setItem("escrows", JSON.stringify([...escrows, escrow]));
    // console.log(escrow);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input type="text" id="eth" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} signer={signer} />;
          })}
        </div>
      </div>
    </>
  );
}

export default App;

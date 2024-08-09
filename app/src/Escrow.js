import EscrowArtifact from "./artifacts/contracts/Escrow.sol/Escrow";
import { ethers } from "ethers";
import { approve } from "./App";

export default function Escrow({ address, arbiter, beneficiary, value, approved, signer }) {
  const contract = new ethers.Contract(address, EscrowArtifact.abi, signer);
  const handleApprove = async () => {
    contract.on("Approved", () => {
      document.getElementById(contract.address).className = "complete";
      document.getElementById(contract.address).innerText = "✓ It's been approved!";
      approved = true;
      // localStorage.setItem("escrows", JSON.stringify([...escrows, escrow]));
      const escrowsOld = JSON.parse(localStorage.getItem("escrows")) || [];
      escrowsOld.forEach((escrow) => {
        if (escrow.address === address) {
          escrow.approved = true;
        }
      });
      localStorage.setItem("escrows", JSON.stringify(escrowsOld));
    });

    await approve(contract, signer);
  };
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} </div>
          <div>{approved ? "wrg" : "wegf"}</div>
        </li>
        {approved ? (
          <div className="complete" id={address}>
            ✓ It's been approved!
          </div>
        ) : (
          <div
            className="button"
            id={address}
            onClick={(e) => {
              e.preventDefault();

              handleApprove();
            }}
          >
            Approve
          </div>
        )}
      </ul>
    </div>
  );
}

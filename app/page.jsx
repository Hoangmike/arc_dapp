"use client";
import { useState } from "react";

export default function Page() {
  const [account, setAccount] = useState("");

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const acc = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(acc[0]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 ARC DApp Running</h1>

      <button onClick={connect}>
        {account ? account : "Connect Wallet"}
      </button>

      <br /><br />

      <button onClick={() => window.open("https://faucet.arc.network")}>
        Faucet
      </button>
    </div>
  );
}

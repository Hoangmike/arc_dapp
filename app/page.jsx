"use client";

import React, { useState } from "react";
import { ethers } from "ethers";

// ===== CONFIG =====
const ARC_CHAIN = {
  chainId: "0x66EEE",
  chainName: "ARC Testnet",
  rpcUrls: ["https://rpc.testnet.arc.network"],
  nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 }
};

const USDC = "0x911fe58Ea653059ecea0FFe4193031EB3677F9Fd";
const EURC = "0x911fe58Ea653059ecea0FFe4193031EB3677F9Fd";
const SWAP_CONTRACT = "0x911fe58Ea653059ecea0FFe4193031EB3677F9Fd";
const NFT_CONTRACT = "0x911fe58Ea653059ecea0FFe4193031EB3677F9Fd";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint amount) returns (bool)"
];

const SWAP_ABI = [
  "function swap(address tokenIn, address tokenOut, uint amount) external"
];

const NFT_ABI = [
  "function mint(address to, string memory uri) public"
];

export default function App() {
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState("");
  const [uri, setUri] = useState("");

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    setSigner(signer);
    setAccount(await signer.getAddress());
  };

  const swap = async () => {
    try {
      setStatus("Swapping...");

      const amt = ethers.parseUnits(amount || "0", 6);

      const usdc = new ethers.Contract(USDC, ERC20_ABI, signer);
      const swap = new ethers.Contract(SWAP_CONTRACT, SWAP_ABI, signer);

      await (await usdc.approve(SWAP_CONTRACT, amt)).wait();
      await (await swap.swap(USDC, EURC, amt)).wait();

      setStatus("✅ Swap success");
    } catch (e) {
      setStatus("❌ Swap failed");
    }
  };

  const mint = async () => {
    try {
      setStatus("Minting NFT...");

      const nft = new ethers.Contract(NFT_CONTRACT, NFT_ABI, signer);
      await (await nft.mint(account, uri)).wait();

      setStatus("🎉 NFT Minted");
    } catch {
      setStatus("❌ Mint failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 ARC Hackathon DApp</h1>

      <button onClick={connect}>
        {account ? account : "Connect Wallet"}
      </button>

      <br /><br />

      <button onClick={() => window.open("https://faucet.arc.network")}>
        Faucet
      </button>

      <h2>Swap</h2>
      <input placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />
      <button onClick={swap}>Swap USDC → EURC</button>

      <h2>Mint NFT</h2>
      <input placeholder="Metadata URI" onChange={(e) => setUri(e.target.value)} />
      <button onClick={mint}>Mint NFT</button>

      <p>{status}</p>
    </div>
  );
}

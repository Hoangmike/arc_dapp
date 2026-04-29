"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// ===== CONFIG =====
const ARC_CHAIN = {
  chainId: "0x66EEE", // ⚠️ replace
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

export default function ArcHackathonDapp() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState("");
  const [uri, setUri] = useState("");
  const [usdcBal, setUsdcBal] = useState("0");
  const [eurcBal, setEurcBal] = useState("0");

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN.chainId }] });
    } catch {
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [ARC_CHAIN] });
    }

    const prov = new ethers.BrowserProvider(window.ethereum);
    const signer = await prov.getSigner();
    const addr = await signer.getAddress();

    setProvider(prov);
    setSigner(signer);
    setAccount(addr);

    loadBalances(prov, addr);
  };

  const loadBalances = async (prov, addr) => {
    const usdc = new ethers.Contract(USDC, ERC20_ABI, prov);
    const eurc = new ethers.Contract(EURC, ERC20_ABI, prov);

    const b1 = await usdc.balanceOf(addr);
    const b2 = await eurc.balanceOf(addr);

    setUsdcBal(ethers.formatUnits(b1, 6));
    setEurcBal(ethers.formatUnits(b2, 6));
  };

  const swap = async () => {
    try {
      setStatus("Swapping...");
      const amt = ethers.parseUnits(amount, 6);

      const usdc = new ethers.Contract(USDC, ERC20_ABI, signer);
      const swap = new ethers.Contract(SWAP_CONTRACT, SWAP_ABI, signer);

      await (await usdc.approve(SWAP_CONTRACT, amt)).wait();
      await (await swap.swap(USDC, EURC, amt)).wait();

      setStatus("✅ Swap success");
      loadBalances(provider, account);
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
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto grid gap-6">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="rounded-2xl">
            <CardContent className="p-6 flex flex-col gap-4">
              <h1 className="text-2xl font-bold">🚀 ARC Hackathon DApp</h1>

              <Button onClick={connect}>
                {account ? account.slice(0,6)+"..." : "Connect Wallet"}
              </Button>

              <Button variant="outline" onClick={()=>window.open("https://faucet.arc.network")}>
                💧 Faucet
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-2">💰 Balances</h2>
            <p>USDC: {usdcBal}</p>
            <p>EURC: {eurcBal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col gap-3">
            <h2 className="font-semibold">🔄 Swap</h2>
            <Input placeholder="Amount USDC" onChange={(e)=>setAmount(e.target.value)} />
            <Button onClick={swap}>Swap → EURC</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col gap-3">
            <h2 className="font-semibold">🖼 Mint NFT</h2>
            <Input placeholder="Metadata URI (IPFS)" onChange={(e)=>setUri(e.target.value)} />
            <Button onClick={mint}>Mint NFT</Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-400">{status}</div>
      </div>
    </div>
  );
}

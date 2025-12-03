'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

function AuctionCard({ id }: { id: bigint }) {
  const { data: auction } = useReadContract({
    address: CONTRACTS.marketplace.address,
    abi: CONTRACTS.marketplace.abi,
    functionName: 'getAuction',
    args: [id],
  });

  const { data: winnerData } = useReadContract({
    address: CONTRACTS.marketplace.address,
    abi: CONTRACTS.marketplace.abi,
    functionName: 'getCurrentWinner',
    args: [id],
  });

  if (!auction) return <div className="animate-pulse h-64 bg-gray-900 rounded-xl"></div>;

  const [nftAddress, tokenId, seller, paymentToken, startPrice, startTime, endTime, ended, canceled, bidsCount] = auction;
  const [currentWinner, currentWinningAmount] = winnerData || ['0x0', 0n];

  const isLive = !ended && !canceled && BigInt(Math.floor(Date.now() / 1000)) < endTime;
  const displayPrice = currentWinningAmount > 0n ? currentWinningAmount : startPrice;

  return (
    <Link href={`/auction/${id}`} className="group block">
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/10">
        <div className="aspect-square bg-gray-800 relative flex items-center justify-center">
          {/* Placeholder for NFT Image - In real app, fetch metadata from tokenURI */}
          <span className="text-4xl">🏴‍☠️</span>
          <div className="absolute top-2 right-2">
            {isLive ? (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                LIVE
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs font-bold rounded-full">
                ENDED
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-white mb-1">Arrland NFT #{tokenId.toString()}</h3>
          <p className="text-sm text-gray-400 mb-4">Seller: {seller.slice(0, 6)}...{seller.slice(-4)}</p>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Current Price</p>
              <p className="text-xl font-bold text-white">{formatEther(displayPrice)} mUSDC</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold">Ends In</p>
              <p className="text-sm text-white">{new Date(Number(endTime) * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { data: totalAuctions } = useReadContract({
    address: CONTRACTS.marketplace.address,
    abi: CONTRACTS.marketplace.abi,
    functionName: 'totalAuctions',
  });

  const auctionIds = totalAuctions
    ? Array.from({ length: Number(totalAuctions) }, (_, i) => BigInt(i)).reverse()
    : [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
              Discover Rare Artifacts
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              The premium marketplace for Arrland ecosystem. Bid, win, and collect exclusive NFTs securely on Polygon.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctionIds.map((id) => (
            <AuctionCard key={id.toString()} id={id} />
          ))}
        </div>

        {auctionIds.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No auctions found yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

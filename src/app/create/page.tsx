'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { Navbar } from '@/components/Navbar';
import { parseEther } from 'viem';
import { useState } from 'react';

export default function CreateAuction() {
    const [nftAddress, setNftAddress] = useState(CONTRACTS.nft.address);
    const [tokenId, setTokenId] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [duration, setDuration] = useState('86400'); // 24h

    const { writeContract, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const handleApprove = () => {
        if (!tokenId) return;
        writeContract({
            address: nftAddress as `0x${string}`,
            abi: CONTRACTS.nft.abi,
            functionName: 'approve',
            args: [CONTRACTS.marketplace.address, BigInt(tokenId)],
        });
    };

    const handleCreate = () => {
        if (!tokenId || !startPrice) return;

        const startTime = BigInt(Math.floor(Date.now() / 1000) + 60); // Start in 1 min
        const endTime = startTime + BigInt(duration);

        writeContract({
            address: CONTRACTS.marketplace.address,
            abi: CONTRACTS.marketplace.abi,
            functionName: 'createAuction',
            args: [
                nftAddress as `0x${string}`,
                BigInt(tokenId),
                CONTRACTS.paymentToken.address,
                parseEther(startPrice),
                startTime,
                endTime,
                '0x0000000000000000000000000000000000000000', // Payout to seller
            ],
        });
    };

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    <h1 className="text-3xl font-bold mb-8">Create New Auction</h1>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">NFT Address</label>
                            <input
                                type="text"
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                value={nftAddress}
                                onChange={(e) => setNftAddress(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Token ID</label>
                            <input
                                type="number"
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                value={tokenId}
                                onChange={(e) => setTokenId(e.target.value)}
                                placeholder="e.g. 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Start Price (mUSDC)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                value={startPrice}
                                onChange={(e) => setStartPrice(e.target.value)}
                                placeholder="e.g. 100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Duration (Seconds)</label>
                            <select
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            >
                                <option value="300">5 Minutes (Test)</option>
                                <option value="3600">1 Hour</option>
                                <option value="86400">24 Hours</option>
                                <option value="604800">7 Days</option>
                            </select>
                        </div>

                        <div className="pt-4 space-y-4">
                            <button
                                onClick={handleApprove}
                                disabled={isPending}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-3 rounded-xl transition-colors"
                            >
                                1. Approve NFT
                            </button>

                            <button
                                onClick={handleCreate}
                                disabled={isPending}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20"
                            >
                                2. Create Auction
                            </button>
                        </div>

                        {hash && (
                            <div className="mt-4 p-4 bg-gray-950 rounded-lg text-xs font-mono break-all text-green-400 border border-green-900">
                                Tx Sent: {hash}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { Navbar } from '@/components/Navbar';
import { formatEther, parseEther } from 'viem';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function AuctionDetail({ params }: { params: { id: string } }) {
    const auctionId = BigInt(params.id);
    const { address: userAddress } = useAccount();
    const [bidAmount, setBidAmount] = useState('');

    // Read Auction Data
    const { data: auction, refetch: refetchAuction } = useReadContract({
        address: CONTRACTS.marketplace.address,
        abi: CONTRACTS.marketplace.abi,
        functionName: 'getAuction',
        args: [auctionId],
    });

    // Read Current Winner
    const { data: winnerData, refetch: refetchWinner } = useReadContract({
        address: CONTRACTS.marketplace.address,
        abi: CONTRACTS.marketplace.abi,
        functionName: 'getCurrentWinner',
        args: [auctionId],
    });

    // Read Pending Returns
    const { data: pendingReturn, refetch: refetchPending } = useReadContract({
        address: CONTRACTS.marketplace.address,
        abi: CONTRACTS.marketplace.abi,
        functionName: 'getPendingReturn',
        args: [userAddress || '0x0000000000000000000000000000000000000000', CONTRACTS.paymentToken.address],
    });

    // Write Contract
    const { writeContract, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Actions
    const handleBid = async () => {
        if (!bidAmount) return;

        // First approve (simplified for MVP - in real app check allowance first)
        // For MVP we assume approval is done or we trigger it. 
        // Actually, let's just try to bid. If it fails, user needs to approve.
        // Ideally we should have an "Approve" button first.

        writeContract({
            address: CONTRACTS.marketplace.address,
            abi: CONTRACTS.marketplace.abi,
            functionName: 'placeBid',
            args: [auctionId, parseEther(bidAmount)],
        });
    };

    const handleApprove = () => {
        writeContract({
            address: CONTRACTS.paymentToken.address,
            abi: CONTRACTS.paymentToken.abi,
            functionName: 'approve',
            args: [CONTRACTS.marketplace.address, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")], // MaxUint256
        });
    };

    const handleWithdraw = () => {
        writeContract({
            address: CONTRACTS.marketplace.address,
            abi: CONTRACTS.marketplace.abi,
            functionName: 'withdraw',
            args: [CONTRACTS.paymentToken.address],
        });
    };

    const handleEndAuction = () => {
        writeContract({
            address: CONTRACTS.marketplace.address,
            abi: CONTRACTS.marketplace.abi,
            functionName: 'endAuction',
            args: [auctionId],
        });
    };

    const handleClaimNFT = () => {
        writeContract({
            address: CONTRACTS.marketplace.address,
            abi: CONTRACTS.marketplace.abi,
            functionName: 'claimNFT',
            args: [auctionId],
        });
    };

    if (!auction) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;

    const [nftAddress, tokenId, seller, paymentToken, startPrice, startTime, endTime, ended, canceled, bidsCount] = auction;
    const [currentWinner, currentWinningAmount] = winnerData || ['0x0', 0n];

    const isLive = !ended && !canceled && BigInt(Math.floor(Date.now() / 1000)) < endTime;
    const isSeller = userAddress === seller;
    const isWinner = userAddress === currentWinner;
    const hasPending = pendingReturn && pendingReturn > 0n;

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Image */}
                    <div className="bg-gray-900 rounded-2xl p-8 flex items-center justify-center aspect-square border border-gray-800">
                        <span className="text-9xl">🏴‍☠️</span>
                    </div>

                    {/* Right: Details */}
                    <div>
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold mb-2">Arrland NFT #{tokenId.toString()}</h1>
                            <p className="text-gray-400">Seller: {seller}</p>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-bold mb-1">Current Price</p>
                                    <p className="text-3xl font-bold text-white">
                                        {currentWinningAmount > 0n ? formatEther(currentWinningAmount) : formatEther(startPrice)} mUSDC
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-bold mb-1">Ends In</p>
                                    <p className="text-xl text-white font-mono">
                                        {new Date(Number(endTime) * 1000).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {isLive ? (
                                <div className="space-y-4">
                                    {!userAddress ? (
                                        <ConnectButton />
                                    ) : (
                                        <>
                                            <div className="flex gap-4">
                                                <input
                                                    type="number"
                                                    placeholder="Amount (mUSDC)"
                                                    className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                />
                                                <button
                                                    onClick={handleBid}
                                                    disabled={isPending}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {isPending ? 'Bidding...' : 'Place Bid'}
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleApprove}
                                                disabled={isPending}
                                                className="text-xs text-gray-500 hover:text-white underline"
                                            >
                                                Approve mUSDC first
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-800 rounded-lg text-center">
                                    <p className="text-xl font-bold text-gray-300">Auction Ended</p>
                                    {isWinner && (
                                        <p className="text-green-400 mt-2">You won this auction! 🎉</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions Section */}
                        <div className="space-y-4">
                            {hasPending && (
                                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-yellow-500 font-bold">You have outbid funds!</p>
                                        <p className="text-sm text-yellow-200/70">{formatEther(pendingReturn)} mUSDC available</p>
                                    </div>
                                    <button
                                        onClick={handleWithdraw}
                                        disabled={isPending}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
                                    >
                                        Withdraw
                                    </button>
                                </div>
                            )}

                            {isSeller && !isLive && !ended && (
                                <button
                                    onClick={handleEndAuction}
                                    disabled={isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl"
                                >
                                    End Auction & Distribute Funds
                                </button>
                            )}

                            {isWinner && ended && (
                                <button
                                    onClick={handleClaimNFT}
                                    disabled={isPending}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl"
                                >
                                    Claim NFT
                                </button>
                            )}
                        </div>

                        {hash && (
                            <div className="mt-4 p-4 bg-gray-900 rounded-lg text-xs font-mono break-all">
                                Tx: {hash}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

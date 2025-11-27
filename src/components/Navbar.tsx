'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Navbar() {
    return (
        <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Arrland Auctions
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/create" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Create Auction
                    </Link>
                    <ConnectButton />
                </div>
            </div>
        </nav>
    );
}

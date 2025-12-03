import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Arrland Auctions',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Fallback for dev
    chains: [polygonAmoy],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Arrland Auctions',
    projectId: 'YOUR_PROJECT_ID', // TODO: Get from WalletConnect Cloud
    chains: [polygonAmoy],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

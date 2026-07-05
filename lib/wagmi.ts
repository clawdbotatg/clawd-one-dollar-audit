import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "One Dollar Audit" }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
    [mainnet.id]: http("https://eth.drpc.org"),
  },
  ssr: true,
});

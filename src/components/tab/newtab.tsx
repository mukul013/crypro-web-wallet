'use client'


import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ReloadIcon } from "@radix-ui/react-icons"
import { ToastAction } from "../ui/toast"
import { Keypair } from "@solana/web3.js"
import { useToast } from "../ui/use-toast"
import { requestAirdrop, sendSol } from "@/lib/utils"
import { useState } from "react"
import { RecentTransactions } from "../RecentTransactions"
import { useWallet } from "@/context/wallet-context"

export function TabsDemo({privateKey} : TabsDemoProps) {

  const {accounts, selectedAccount} = useWallet();

  return (
    <Tabs defaultValue="transfer" className="w-full mt-5">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="transfer">Transfer Sol</TabsTrigger>
        <TabsTrigger value="airdrop">Airdrop Sol</TabsTrigger>
        <TabsTrigger value="transaction">Transactions</TabsTrigger>
      </TabsList>
      <TabsContent value="transaction">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
            <RecentTransactions publicKey={accounts[selectedAccount].publicKey} />              {/* <Input id="name" defaultValue="Pedro Duarte" /> */}
            </div>
            {/* <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </div> */}
          </CardContent>
          <CardFooter>
            {/* <Button>Save changes</Button> */}
          </CardFooter>
        </Card>
      </TabsContent>


      <SendSol privateKey={privateKey} />


      <TabsContent value="airdrop" className="w-full h-full">
        <Card>
          <CardHeader>
            <CardTitle>Solana Airdrop</CardTitle>
            <CardDescription>Get 1 SOL in your address.</CardDescription>
          </CardHeader>
          <CardFooter>
            <RequestAirdrop privateKey={privateKey}/>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

interface TabsDemoProps {
    privateKey :string
}

const SendSol = ({ privateKey }: TabsDemoProps) => {

    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();
  
    const handleSendSol = async () => {
      setIsLoading(true);
      try {
        const secretKey = Uint8Array.from(Buffer.from(privateKey, "hex"));
        const fromKeypair = Keypair.fromSecretKey(secretKey);
        const fromPubkey = Keypair.fromSecretKey(secretKey).publicKey.toBase58();
        const solToSend = amount;
        const signature = await sendSol(
          "devnet",
          fromKeypair,
          fromPubkey,
          toAddress,
          solToSend
        );
  
        toast({
          title: "Transfer Successful ✅",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() =>
                window.open(
                  `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
                  "_blank"
                )
              }
            >
              View ↗
            </ToastAction>
          ),
        });
      } catch (error) {
        toast({
          title: "Transfer Failed ❌",
          description:
            error instanceof Error
              ? error.message.includes("insufficient lamports")
                ? "Insufficient Balance"
                : error.message
              : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <TabsContent value="transfer">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Sol</CardTitle>
            <CardDescription>Transfer Sol to any solana address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Enter Solana Address</Label>
              <Input id="current" type="text"  onChange={(e) => setToAddress(e.target.value)}
 />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Enter Amount</Label>
              <Input id="new" type="number" onChange={(e) => setAmount(Number(e.target.value))}/>
            </div>
          </CardContent>
          <CardFooter>
          <Button onClick={handleSendSol} disabled={isLoading}>
          {" "}
          {isLoading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Transfering...
            </>
          ) : (
            "Transfer Sol"
          )}
        </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    );
};

const RequestAirdrop = ({ privateKey }: TabsDemoProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const secretKey = Uint8Array.from(Buffer.from(privateKey, "hex"));
    const publicKey = Keypair.fromSecretKey(secretKey).publicKey.toBase58();
  
    const requestSolAirdrop = async () => {
      setIsLoading(true);
      try {
        const sig = await requestAirdrop("devnet", publicKey);
        toast({
          title: "Airdrop Successful ✅",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() =>
                window.open(
                  `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
                  "_blank"
                )
              }
            >
              View ↗
            </ToastAction>
          ),
        });
      } catch (error) {
        toast({
          title: "Airdrop Failed  ❌",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Button onClick={requestSolAirdrop} disabled={isLoading}>
        {isLoading ? (
          <>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Requesting...
          </>
        ) : (
          "Request Airdrop"
        )}
      </Button>
    );
  };


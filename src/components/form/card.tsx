'use client'

import * as React from "react";
import { LuWallet } from "react-icons/lu";
import { IoKeyOutline } from "react-icons/io5";
import { IoCopyOutline } from "react-icons/io5";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateMnemonic } from "bip39";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { generateWallets, getSolanaBalance } from "@/lib/utils";
import { TabsDemo } from "../tab/newtab";
import { useToast } from "../ui/use-toast";
import { useWallet } from "@/context/wallet-context";
import { useBalance } from "@/hooks/useBalance";

interface Account {
  publicKey: string;
  privateKey: string;
}

interface TabsSelectedAccount {
  selectedAccount: number;
  setSelectedAccount: Dispatch<SetStateAction<number>>;
  accounts: Account[];
  setAccounts: Dispatch<SetStateAction<Account[]>>;
}

export function CardWithForm() {


  const {accounts,setAccounts,mnemonic,setMnemonic,selectedAccount,setSelectedAccount} = useWallet()
  // const [mnemonic, setMnemonic] = useState("");
  // const [accounts, setAccounts] = useState<Account[]>([]);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  // const [balance, setBalance] = useState<number>(0);
  const [isCopying, setIsCopying] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [isDataReady, setIsDataReady] = useState(false);


  const currentAccount = accounts[selectedAccount];
  const balance = useBalance(currentAccount?.publicKey);

  const copyAddress = async () => {
    setIsCopying(true);
    await navigator.clipboard.writeText(accounts[selectedAccount].publicKey);
    setTimeout(() => setIsCopying(false), 1000);
  };

  const copyMnemonic = async () => {
    setIsCopying(true);
    await navigator.clipboard.writeText(mnemonic);
    setTimeout(() => setIsCopying(false), 1000);
  };

  const generateRecoveryPhrase = () => {
    const mn = generateMnemonic();
    setMnemonic(mn);
    localStorage.setItem("mnemonic", mn);
  };

  const handleCheckboxChange = () => {
    setIsCheckboxChecked(!isCheckboxChecked);
  };

  const saveWallets = async () => {
    const existingAccounts: Account[] = JSON.parse(
      localStorage.getItem("accounts") || "[]"
    );
    const mnemonicPharse = localStorage.getItem("mnemonic");

    if (mnemonicPharse) {
      const keypair = await generateWallets(
        mnemonicPharse,
        existingAccounts.length
      );
      const newAccount: Account = {
        publicKey: keypair.publicKey.toString(),
        privateKey: Buffer.from(keypair.secretKey).toString("hex"),
      };
      existingAccounts.push(newAccount);
      setAccounts(existingAccounts);
      setSelectedAccount(existingAccounts.length - 1);
      localStorage.setItem("accounts", JSON.stringify(existingAccounts));
    }
  };

  const mnemonicPharseArray = mnemonic?.split(" ");

  useEffect(() => {
    const initializeData = async () => {
      const mnemonicPhrase = localStorage.getItem("mnemonic") || "";
      setMnemonic(mnemonicPhrase);

      const existingAccounts: Account[] = JSON.parse(
        localStorage.getItem("accounts") || "[]"
      );
      setAccounts(existingAccounts);

      // if (existingAccounts.length > 0) {
      //   setPrivateKey(existingAccounts[selectedAccount]?.privateKey);

      //   try {
      //     const currentBalance = await getSolanaBalance(
      //       "devnet",
      //       existingAccounts[selectedAccount].publicKey
      //     );
      //     setBalance(currentBalance);
      //   } catch (error) {
      //     console.error("Error fetching balance:", error);
      //   }
      // }

      setIsDataReady(true);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {

      // const fetchBalance = async () => {
      //   const currentBalance = await getSolanaBalance(
      //     "devnet",
      //     accounts[selectedAccount].publicKey
      //   );
      //   setBalance(currentBalance);
      // };

      // fetchBalance();
      setPrivateKey(accounts[selectedAccount]?.privateKey);

      // const intervalId = setInterval(fetchBalance, 5000);
      // return () => clearInterval(intervalId);
    }
  }, [accounts, selectedAccount]);

  return (
    <div className="h-full w-full flex justify-center items-center">
      {!mnemonic && (
        <Card
          className={`w-full max-w-3xl mx-auto h-auto min-h-[70vh]  ${
            showRecoveryPhrase ? "opacity-0" : "opacity-100"
          }`}
        >
          <CardHeader className="mt-5">
            <div className="flex justify-center">
              <LuWallet className="h-8 w-8" />
            </div>
            <CardTitle className="text-4xl text-center font-serif font-medium">
              Create a new wallet
            </CardTitle>
            <CardDescription className="text-center text-2xl font-serif">
              Make sure you save your recovery phrase.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center mt-20">
            <Button onClick={generateRecoveryPhrase}>
              GENERATE RECOVERY PHRASE
            </Button>
          </CardContent>
        </Card>
      )}

      {mnemonic && accounts.length == 0 && (
        <Card
          className={`w-full max-w-3xl mx-auto h-auto min-h-[70vh] opacity-100`}
        >
          <CardHeader className="mt-2">
            <div className="flex justify-center">
              <IoKeyOutline className="h-8 w-8" />
            </div>
            <CardTitle className="text-4xl text-center font-serif font-medium">
              Secret recovery phrase
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base lg:text-xl font-serif px-4 sm:px-10 lg:px-20">
              <span className="hidden sm:inline">
                This is the only way to recover your account if you lose your
                device. Write it down and store it in a safe place.
              </span>
              <span className="sm:hidden">
                Write down your recovery phrase and store it safely.
              </span>
            </CardDescription>{" "}
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {mnemonicPharseArray?.map((text, index) => (
              <Button key={index} variant="outline">
                <span className="mr-2 font-bold">{index + 1}.</span> {text}
              </Button>
            ))}
          </CardContent>

          <CardFooter className="flex flex-col">
            <Button variant="ghost" onClick={copyMnemonic}>
              {isCopying ? (
                "✅ Copied"
              ) : (
                <div className="flex">
                  <IoCopyOutline className="mt-1" />
                  <span className="ml-2">{/* This adds a small gap */}</span>
                  Copy
                </div>
              )}
            </Button>

            <div className="flex items-center space-x-2 mt-5">
              <Checkbox
                id="terms"
                checked={isCheckboxChecked}
                onCheckedChange={handleCheckboxChange}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I saved my secret recovery phrase.
              </label>
            </div>

            <Button
              disabled={!isCheckboxChecked}
              onClick={saveWallets}
              className="mt-2 w-full md:w-auto"
            >
              Next
            </Button>
          </CardFooter>
        </Card>
      )}

      {isDataReady && accounts.length >= 1 && (
        <Card className={`w-full max-w-3xl mx-auto h-auto min-h-[70vh]  opacity-100`}>
          <CardHeader className="mt-2">
            <CardTitle className="text-4xl text-center font-serif font-medium">
              Account <span>{selectedAccount + 1}</span>
            </CardTitle>
            {/* <CardDescription className="text-center text-xl font-serif px-20">This is the only way to recover your account if you lose your device. Write it down and store it in a safe place.</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="font-sans font-semibold">
                Balance: {balance !== null ? `${balance} SOL` : "Loading..."}
              </div>
              <div className="w-48">
                <Button
                  variant={"outline"}
                  onClick={copyAddress}
                  className="w-full"
                >
                  {isCopying ? "✅ Copied" : "🪪 Your Wallet Address"}
                </Button>
              </div>
            </div>

            <TabsDemo privateKey={privateKey} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

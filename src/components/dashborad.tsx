"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { FaWallet } from "react-icons/fa6";

import {
  IconArrowLeft,
  IconBrandTabler,
  IconPlus,
  IconSettings,
  IconUserBolt,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn, generateWallets } from "@/lib/utils";
import { CardWithForm } from "./form/card";
import { Button } from "./ui/button";
import { useWallet } from "@/context/wallet-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export function SidebarDemo() {
  const { accounts, setAccounts, mnemonic, setMnemonic, setSelectedAccount, selectedAccount } = useWallet();
  const [showPrivateKey, setShowPrivateKey] = useState<string | null>(null);

  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    setAccounts(storedAccounts);

    const mnemonicPharse = localStorage.getItem("mnemonic") || "a";
    setMnemonic(mnemonicPharse);
  }, [selectedAccount]);

  const saveWallets = async () => {
    const existingAccounts: Account[] = JSON.parse(
      localStorage.getItem("accounts") || "[]"
    );
    const mnemonicPharse = localStorage.getItem("mnemonic") || "";

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

  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {accounts.map((account, idx) => (
                <div key={idx} className="flex items-center justify-between px-2">
                  <SidebarLink
                    link={{
                      label: `Account ${idx + 1}`,
                      href: "#",
                      icon: (
                        <IconWallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                      ),
                    }}
                    onClick={() => setSelectedAccount(idx)}
                    className={cn(
                      "px-3 rounded-md", 
                      selectedAccount === idx && "bg-slate-50 text-accent-foreground shadow-md"
                    )}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        {/* <span className="sr-only">Open menu</span> */}
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowPrivateKey(account.privateKey)}>
                        Show Private Key
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
          <div>
            {accounts.length > 0 ? (
              <SidebarLink
                link={{
                  label: "Add New Wallet",
                  href: "#",
                  icon: (
                    <FaWallet />
                  ),
                }}
                onClick={saveWallets}
              />
            ) : (
              <SidebarLink
                link={{
                  label: "Made by Mukul Rawat",
                  href: "https://x.com/cryto_brah",
                  icon: (
                    <Image
                      src="https://pbs.twimg.com/profile_images/1822228494383718400/OBTjXZnJ_400x400.jpg"
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
              />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
      {showPrivateKey && (
        <Dialog open={!!showPrivateKey} onOpenChange={() => setShowPrivateKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Private Key</DialogTitle>
              <DialogDescription>
                Keep this private key secure. Never share it with anyone.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-muted rounded-md">
              <code className="text-sm break-all">{showPrivateKey}</code>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowPrivateKey(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className=" text-xl font-serif text-black dark:text-white whitespace-pre"
      >
        Manage Wallets
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="h-screen flex justify-center items-center">
          <CardWithForm
          />
        </div>
      </div>
    </div>
  );
};

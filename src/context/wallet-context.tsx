'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';

interface Account {
  publicKey: string;
  privateKey: string;
}

interface WalletContextType {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  selectedAccount: number;
  setSelectedAccount: React.Dispatch<React.SetStateAction<number>>;
  mnemonic: string;
  setMnemonic: React.Dispatch<React.SetStateAction<string>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [mnemonic, setMnemonic] = useState("");


  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    setAccounts(storedAccounts);

    const mnemonicPhrase = localStorage.getItem("mnemonic") || "";
    setMnemonic(mnemonicPhrase);
  }, []);

  return (
    <WalletContext.Provider value={{ 
      accounts, 
      setAccounts, 
      selectedAccount, 
      setSelectedAccount,
      mnemonic,
      setMnemonic
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
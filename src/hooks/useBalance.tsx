import { createConnection } from '@/lib/utils';
import { Connection, PublicKey } from '@solana/web3.js';
import { useState, useEffect } from 'react';

export function useBalance(publicKey: string) {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!publicKey) return;

    async function getBalance() {
      const connection = await createConnection('devnet');
      const pk = new PublicKey(publicKey);

      const subscription = connection.onAccountChange(
        pk,
        (updatedAccountInfo) => {
          setBalance(updatedAccountInfo.lamports / 1e9); // Convert lamports to SOL
        },
        'confirmed'
      );

      // Initial balance fetch
      connection.getBalance(pk).then((initialBalance) => {
        setBalance(initialBalance / 1e9);
      });
    }

    getBalance()

    // return () => {
    //   connection.removeAccountChangeListener(subscription);
    // };
  }, [publicKey]);

  return balance;
}
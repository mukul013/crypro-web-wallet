import { useEffect, useState } from "react";
import { Connection, PublicKey, ParsedTransactionWithMeta, VersionedTransactionResponse } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { createConnection } from "@/lib/utils";

export const RecentTransactions = ({ publicKey }: { publicKey: string }) => {
    
  const [transactions, setTransactions] = useState<ParsedTransactionWithMeta[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const connection = await createConnection('devnet')
      const address = new PublicKey(publicKey);
      const signatures = await connection.getSignaturesForAddress(address, { limit: 5 });
      
      const parsedTransactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          return tx;
        })
      );

      setTransactions(parsedTransactions.filter((tx): tx is ParsedTransactionWithMeta => tx !== null));
    };

    fetchTransactions();
  }, [publicKey]);

  const getTransactionDescription = (transaction: ParsedTransactionWithMeta) => {
    const instruction = transaction.transaction.message.instructions[0];
    if ('parsed' in instruction) {
      const { type, info } = instruction.parsed;
      if (type === 'transfer') {
        const amount = info.lamports / 1e9;
        if (info.source === publicKey) {
          return `Sent ${amount} SOL`;
        } else {
          return `Received ${amount} SOL`;
        }
      } else if (type === 'create') {
        return 'Created new account';
      }
    }
    return 'Unknown transaction type';
  };

  const openInExplorer = (signature: string) => {
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
  };

  return (
    <div className="space-y-4">
      {transactions.map((tx, index) => (
        <div key={index} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{getTransactionDescription(tx)}</p>
            <p className="text-sm text-gray-500">{new Date(tx.blockTime! * 1000).toLocaleString()}</p>
          </div>
          <Button onClick={() => openInExplorer(tx.transaction.signatures[0])}>
            View
          </Button>
        </div>
      ))}
    </div>
  );
};
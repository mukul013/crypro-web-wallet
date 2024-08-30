import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl"
import { Connection, Keypair , LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction} from "@solana/web3.js";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateWallets(mnemonic : string , currentIndex : number){
  const seed =  await mnemonicToSeed(mnemonic);
  const path = `m/44'/501'/${currentIndex}'/0'`;
  const derivedSeed = derivePath(path, seed.toString('hex')).key;
  const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
  const keypair = Keypair.fromSecretKey(secret);
  return keypair
}

export async function createConnection(network: string) {
  if (network === 'devnet') {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || '' ;
    return new Connection(rpcUrl);
  }else{
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || clusterApiUrl("mainnet-beta") ;
    return new Connection(rpcUrl);
  }
}

export async function getSolanaBalance(network: string , publicKey : string){
  const connection = await createConnection(network);
  const myAddress = new PublicKey(publicKey)
  const lamports = await connection.getBalance(myAddress).catch( (err) => {
    console.error(`Error Getting Solana Balance: ${err}`);
  }) as number;

  return (lamports / LAMPORTS_PER_SOL);
}

export async function requestAirdrop(network: string , publicKey : string){
  try {
    const connection = await createConnection(network);
    const myAddress = new PublicKey(publicKey);
    const signature = await connection.requestAirdrop(myAddress, LAMPORTS_PER_SOL);
    return signature;
  } catch (error) {
    console.error("Airdrop request failed:", error);
    throw error;
  }
}

export async function sendSol(network: string ,fromKeypair : Keypair , fromPubkey : string , toPubkey: string , solToSend: number){
  const connection = await createConnection(network);
  const myAddress = new PublicKey(fromPubkey);
  const receiverAddress = new PublicKey(toPubkey)
  console.log(solToSend , LAMPORTS_PER_SOL )
  const lamportsToSend = solToSend * LAMPORTS_PER_SOL;
 
  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: myAddress,
      toPubkey: receiverAddress,
      lamports: lamportsToSend,
    }),
  );
  // Send transaction and get the signature
  const signature = await connection.sendTransaction(
    transferTransaction,
    [fromKeypair],
    {
      preflightCommitment:'confirmed'
    }
  );
  // Return the transaction signature
  return signature;
}

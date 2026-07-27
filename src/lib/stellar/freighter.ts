import freighterApi from '@stellar/freighter-api';

const {
  isConnected,
  getPublicKey,
  signTransaction,
  requestAccess,
  getNetwork,
} = freighterApi;

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    await isConnected();
    return true;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<string> {
  await requestAccess();
  return getUserAddress();
}

export async function getUserAddress(): Promise<string> {
  const r = await getPublicKey();
  return typeof r === 'string' ? r : (r as { publicKey?: string }).publicKey ?? '';
}

export async function getWalletNetwork(): Promise<string> {
  const r = await getNetwork();
  return typeof r === 'string' ? r : 'testnet';
}

export async function signTx(xdr: string, networkPassphrase: string): Promise<string> {
  const r = await signTransaction(xdr, { networkPassphrase });
  return typeof r === 'string' ? r : '';
}

export async function signNonce(nonce: string, networkPassphrase: string): Promise<string> {
  const { TransactionBuilder, BASE_FEE, Operation } = await import('@stellar/stellar-sdk');
  const address = await getUserAddress();
  const dummy = {
    accountId: () => address,
    sequenceNumber: () => '0',
    incrementSequenceNumber: () => {},
  } as any;

  const tx = new TransactionBuilder(dummy, { fee: BASE_FEE, networkPassphrase })
    .addOperation(Operation.manageData({ name: 'hamplard_nonce', value: Buffer.from(nonce) }))
    .setTimeout(30)
    .build();

  return signTx(tx.toXDR(), networkPassphrase);
}

export function watchWallet(onChange: (address: string) => void): () => void {
  return () => undefined;
}

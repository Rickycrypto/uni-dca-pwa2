
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createConfig, http, WagmiProvider, useAccount } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { createPublicClient, createWalletClient, custom, parseEther, formatUnits } from 'viem';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { useConnect, useDisconnect } from 'wagmi';
import { useDcaStore } from '../lib/strategy';
import { quoteUniExactIn, executeSwapUniversalRouter } from '../lib/uniswap';
import { DEFAULT_SETTINGS, useDcaStore } from '../lib/strategy';

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http() // uses public RPC; recommend Infura/Alchemy in .env
  },
  connectors: [
    new WalletConnectConnector({
      options: {
        projectId: 'demo-project-id', // replace with your WalletConnect Cloud projectId
        showQrModal: true
      }
    })
  ]
});

function ConnectBar() {
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: 'white' }}>
      <div><b>UNI DCA Trader</b></div>
      <div>
        {isConnected ? (
          <>
            <span style={{ marginRight: 12 }}>{address?.slice(0,6)}…{address?.slice(-4)}</span>
            <button onClick={() => disconnect()}>Disconnect</button>
          </>
        ) : (
          <button onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</button>
        )}
      </div>
    </div>
  );
}

function StrategyPanel() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();
  const stepAmount = settings.baseOrderUsd;

  async function doQuote() {
    setLoading(true);
    try {
      const out = await quoteUniExactIn(stepAmount, settings);
      setQuote(out.human);
    } catch (e:any) {
      setQuote('Quote failed: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  }

  async function doSwap() {
    if (!address) { alert('Connect wallet first'); return; }
    setLoading(true);
    try {
      const res = await executeSwapUniversalRouter(stepAmount, settings);
      alert('Tx sent: ' + res.txHash);
    } catch (e:any) {
      alert('Swap failed: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 840, margin: '20px auto', padding: 16 }}>
      <h2>Strategy</h2>
      <p>This demo places laddered buys (“DCA”) as price drops, capped by max drawdown exposure.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <label>Base order size (USD)<br/>
          <input type="number" value={settings.baseOrderUsd} onChange={e=>setSettings({...settings, baseOrderUsd: Number(e.target.value)})} />
        </label>
        <label>Max steps<br/>
          <input type="number" value={settings.maxSteps} onChange={e=>setSettings({...settings, maxSteps: Number(e.target.value)})} />
        </label>
        <label>Step drop % (gap)<br/>
          <input type="number" value={settings.stepDropPct} onChange={e=>setSettings({...settings, stepDropPct: Number(e.target.value)})} />
        </label>
        <label>Slippage %<br/>
          <input type="number" value={settings.slippagePct} onChange={e=>setSettings({...settings, slippagePct: Number(e.target.value)})} />
        </label>
        <label>Max exposure USD<br/>
          <input type="number" value={settings.maxExposureUsd} onChange={e=>setSettings({...settings, maxExposureUsd: Number(e.target.value)})} />
        </label>
        <label>Take-profit % (from average cost)<br/>
          <input type="number" value={settings.takeProfitPct} onChange={e=>setSettings({...settings, takeProfitPct: Number(e.target.value)})} />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <button disabled={loading} onClick={doQuote}>Get Quote</button>
        <button disabled={loading} onClick={doSwap} style={{ marginLeft: 8 }}>Execute Buy</button>
      </div>
      <pre style={{ background: '#f7f7f7', padding: 12, marginTop: 12 }}>{quote}</pre>
    </div>
  );
}

import CapitalPanel from './CapitalPanel'

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <ConnectBar/>
      <StrategyPanel/>
    <CapitalPanel/>
    </WagmiProvider>
  );
}


'use client';
import { useState } from 'react'
import { useDcaStore, resizedBaseOrderFromCapital } from '../lib/strategy'

export default function CapitalPanel() {
  const [amount, setAmount] = useState(0)
  const { settings, injectCapital } = useDcaStore()
  return (
    <div style={{ maxWidth: 840, margin: '10px auto', padding: 16, borderTop: '1px solid #eee' }}>
      <h3>Capital</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>Total Capital (USD): <b>${'{'}settings.totalCapitalUsd{'}'}</b></div>
        <div>Suggested Base Order: <b>${'{'}resizedBaseOrderFromCapital(settings.totalCapitalUsd){'}'}</b></div>
      </div>
      <div style={{ marginTop: 10 }}>
        <input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} placeholder="Add capital (USD)" />
        <button onClick={()=>{ injectCapital(amount); setAmount(0); }} style={{ marginLeft: 8 }}>Add</button>
      </div>
    </div>
  )
}

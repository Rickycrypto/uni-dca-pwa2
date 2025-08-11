
export const metadata = {
  title: 'UNI DCA Trader',
  description: 'Uniswap v3 DCA/averaging strategy with WalletConnect',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

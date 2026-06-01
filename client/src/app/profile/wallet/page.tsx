'use client';

import { Button } from "@/components/reusable/ui/button";
import { useAuth } from "@/context/AuthContext";
import { walletApiService, ListTransactionType } from "@/services/walletApiService";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { paymentServiceApi } from "@/services/paymentApiService";

/* ── Types ──────────────────────────────────────────────────── */
type TransactionType = 'CREDIT' | 'DEBIT';
type FilterTab = 'ALL' | 'CREDIT' | 'DEBIT';

interface Wallet {
  id: string;
  ownerId: string;
  ownerType: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  reason: string;
  createdAt: string;
}

const PAGE_LIMIT = 4;

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Credits', value: 'CREDIT' },
  { label: 'Debits', value: 'DEBIT' },
];

const REASON_LABELS: Record<string, string> = {
  APPOINTMENT_PAYMENT: 'Appointment Payment',
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  REFUND: 'Refund',
  ADJUSTMENT: 'Adjustment',
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
}

/* ── Icons ──────────────────────────────────────────────────── */
function IconWallet({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
function IconArrowDown({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  );
}
function IconArrowUp({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
function IconPlus({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconBank({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
    </svg>
  );
}
function IconX({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconCheckCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/* ── Deposit Modal ──────────────────────────────────────────── */
// function DepositModal({
//   currency,
//   onConfirm,
//   onClose,
//   loading,
// }: {
//   currency: string;
//   onConfirm: (amount: number) => void;
//   onClose: () => void;
//   loading: boolean;
// }) {
//   const [amount, setAmount] = useState('');
//   const ref = useRef<HTMLInputElement>(null);
//   useEffect(() => { ref.current?.focus(); }, []);

//   const quickAmounts = [10, 25, 50, 100, 250, 500];
//   const parsed = parseFloat(amount);
//   const valid = !isNaN(parsed) && parsed > 0;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
//       <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
//         <div className="flex items-center justify-between px-5 py-4 border-b border-border">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
//               <IconArrowDown className="w-3.5 h-3.5 text-green-600" />
//             </div>
//             <h2 className="text-sm font-semibold text-foreground">Deposit Funds</h2>
//           </div>
//           <button onClick={onClose} disabled={loading} className="text-muted-foreground hover:text-foreground disabled:opacity-50">
//             <IconX className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="px-5 py-4 space-y-4">
//           <div>
//             <label className="block text-xs font-medium text-muted-foreground mb-1.5">Amount ({currency})</label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
//               <input
//                 ref={ref}
//                 type="number"
//                 min="1"
//                 step="0.01"
//                 value={amount}
//                 onChange={e => setAmount(e.target.value)}
//                 disabled={loading}
//                 placeholder="0.00"
//                 className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
//               />
//             </div>
//           </div>

//           <div>
//             <p className="text-xs text-muted-foreground mb-2">Quick select</p>
//             <div className="grid grid-cols-3 gap-1.5">
//               {quickAmounts.map(q => (
//                 <button
//                   key={q}
//                   onClick={() => setAmount(String(q))}
//                   disabled={loading}
//                   className={`text-xs py-1.5 rounded-md border transition-colors font-medium ${
//                     amount === String(q)
//                       ? 'bg-primary text-primary-foreground border-primary'
//                       : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
//                   }`}
//                 >
//                   ${q}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
//           <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
//           <Button
//             size="sm"
//             className="bg-green-600 text-white hover:bg-green-700"
//             disabled={loading || !valid}
//             onClick={() => onConfirm(parsed)}
//           >
//             {loading ? 'Processing…' : `Deposit $${valid ? parsed.toFixed(2) : '0.00'}`}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

interface WithdrawFormData {
  amount: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  notes: string;
}

function WithdrawModal({
  currency,
  balance,
  onConfirm,
  onClose,
  loading,
}: {
  currency: string;
  balance: number;
  onConfirm: (data: WithdrawFormData) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<WithdrawFormData>({
    amount: '', accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '', notes: '',
  });

  const update = (k: keyof WithdrawFormData, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const parsed = parseFloat(form.amount);
  const valid = !isNaN(parsed) && parsed > 0 && parsed <= balance
    && form.accountHolderName.trim() && form.accountNumber.trim()
    && form.bankName.trim() && form.ifscCode.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
              <IconBank className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Withdraw Funds</h2>
              <p className="text-[10px] text-muted-foreground">Available: {formatCurrency(balance, currency)}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="text-muted-foreground hover:text-foreground disabled:opacity-50">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Withdrawal Amount ({currency})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
              <input
                type="number"
                min="1"
                max={balance}
                step="0.01"
                value={form.amount}
                onChange={e => update('amount', e.target.value)}
                disabled={loading}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
              />
            </div>
            {parsed > balance && (
              <p className="text-[10px] text-destructive mt-1">Amount exceeds available balance.</p>
            )}
          </div>

          {/* Bank details */}
          <div className="rounded-lg bg-muted/40 border border-border p-3.5 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bank Details</p>

            {[
              { label: 'Account Holder Name', key: 'accountHolderName', placeholder: 'Full name as on account' },
              { label: 'Account Number', key: 'accountNumber', placeholder: 'Enter account number' },
              { label: 'Bank Name', key: 'bankName', placeholder: 'e.g. State Bank of India' },
              { label: 'IFSC / Routing Code', key: 'ifscCode', placeholder: 'e.g. SBIN0001234' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">{field.label}</label>
                <input
                  type="text"
                  value={(form as unknown as Record<string, string>)[field.key]}
                  onChange={e => update(field.key as keyof WithdrawFormData, e.target.value)}
                  disabled={loading}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                />
              </div>
            ))}

            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                disabled={loading}
                placeholder="Any additional notes…"
                rows={2}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading || !valid}
            onClick={() => onConfirm(form)}
          >
            {loading ? 'Submitting…' : 'Request Withdrawal'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Transaction Row ────────────────────────────────────────── */
function TransactionRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.type === 'CREDIT';

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Icon */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isCredit ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
        }`}>
        {isCredit
          ? <IconArrowDown className="w-3.5 h-3.5 text-green-600" />
          : <IconArrowUp className="w-3.5 h-3.5 text-red-500" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground leading-snug">
          {REASON_LABELS[txn.reason] ?? txn.reason}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatDate(txn.createdAt)} · {formatTime(txn.createdAt)}
        </p>
      </div>

      {/* Badge */}
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${isCredit
        ? 'bg-green-50 text-green-700 border-green-100'
        : 'bg-red-50 text-red-700 border-red-100'
        }`}>
        {isCredit ? 'Credit' : 'Debit'}
      </span>

      {/* Amount */}
      <p className={`text-sm font-semibold shrink-0 ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
        {isCredit ? '+' : '-'}${txn.amount.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function UserWallet() {
  const { user } = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [page, setPage] = useState(1);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  /* fetch wallet */
  const fetchWallet = useCallback(async () => {
    setLoadingWallet(true);
    try {
      const res = await walletApiService.getWallet(`id ownerId ownerType balance currency isActive`);
      if (res?.errors) { toast.error('Failed to load wallet'); return; }
      const w = res?.data?.getWallet;
      setWallet(w);
      return w?.id as string;
    } catch {
      toast.error('Failed to load wallet');
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  /* fetch transactions */
  const fetchTransactions = useCallback(async (walletId: string) => {
    setLoadingTxns(true);
    try {
      const res = await walletApiService.listTransactions(
        {
          input: {
            page,
            limit: PAGE_LIMIT,
            walletId,
            type: ListTransactionType[activeTab],
          },
        },
        `transactions { id walletId type amount reason createdAt } totalTransactions`
      );
      if (res?.errors) { toast.error('Failed to load transactions'); return; }
      const d = res?.data?.listTransactions;
      setTransactions(d?.transactions ?? []);
      setTotal(d?.totalTransactions ?? 0);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoadingTxns(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchWallet().then(wid => { if (wid) fetchTransactions(wid); });
  }, [user]);

  useEffect(() => {
    if (wallet?.id) fetchTransactions(wallet.id);
  }, [page, activeTab]);

  useEffect(() => { setPage(1); }, [activeTab]);

  /* withdraw handler */
  const handleWithdraw = async (
    data: WithdrawFormData
  ) => {
    setWithdrawLoading(true);

    try {
      const res =
        await paymentServiceApi.withdrawUserMoney({
          input: {
            amount: Number(data.amount),
            accountHolderName:
              data.accountHolderName,
            accountNumber:
              Number(data.accountNumber),
            bankName: data.bankName,
            ifscCode: data.ifscCode,
            notes: data.notes,
          },
        });

      if (res?.errors) {
        toast.error(
          res.errors[0]?.message ??
          'Withdrawal failed'
        );
        return;
      }

      if (res?.data?.withdrawUserMoney) {
        toast.success(
          'Withdrawal request submitted'
        );
      }

      setShowWithdraw(false);

      await fetchWallet();

      if (wallet?.id) {
        await fetchTransactions(wallet.id);
      }
    } catch {
      toast.error('Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-8">
      <div className="max-w-3xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">My Wallet</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your balance and transactions</p>
        </div>

        {/* Wallet Card */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          {loadingWallet ? (
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : wallet ? (
            <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Balance */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <IconWallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Available Balance</p>
                  <p className="text-2xl font-bold text-foreground leading-tight">
                    {formatCurrency(wallet.balance, wallet.currency)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{wallet.currency}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${wallet.isActive
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                      {wallet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* <Button
                  size="sm"
                  className="h-8 text-xs px-3 bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5"
                  onClick={() => setShowDeposit(true)}
                >
                  <IconPlus className="w-3 h-3" />
                  Deposit
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3 flex items-center gap-1.5"
                  onClick={() => setShowWithdraw(true)}
                  disabled={!wallet.isActive || wallet.balance <= 0}
                >
                  <IconBank className="w-3 h-3" />
                  Withdraw
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No wallet found.
            </div>
          )}
        </div>

        {/* Transactions */}
        <div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-3">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
              {total > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{total} transaction{total !== 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="flex gap-1 flex-wrap">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${activeTab === tab.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/50 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">Transaction</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24 text-right">Amount</p>
            </div>

            {loadingTxns ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-36 bg-muted animate-pulse rounded" />
                      <div className="h-2 w-24 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-14 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <IconWallet className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs mt-1">
                  {activeTab !== 'ALL'
                    ? `No ${activeTab.toLowerCase()} transactions found.`
                    : 'Your transaction history will appear here.'}
                </p>
              </div>
            ) : (
              transactions.map(txn => <TransactionRow key={txn.id} txn={txn} />)
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" disabled={page <= 1 || loadingTxns} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} className="px-1.5 text-xs text-muted-foreground self-center">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant="outline"
                      size="sm"
                      className={`h-7 w-7 text-xs p-0 ${page === p ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                      onClick={() => setPage(p as number)}
                      disabled={loadingTxns}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" disabled={page >= totalPages || loadingTxns} onClick={() => setPage(p => p + 1)}>
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* {showDeposit && (
        <DepositModal
          currency={wallet?.currency ?? 'USD'}
          onConfirm={handleDeposit}
          onClose={() => setShowDeposit(false)}
          loading={depositLoading}
        />
      )} */}

      {showWithdraw && wallet && (
        <WithdrawModal
          currency={wallet.currency}
          balance={wallet.balance}
          onConfirm={handleWithdraw as any}
          onClose={() => setShowWithdraw(false)}
          loading={withdrawLoading}
        />
      )}
    </div>
  );
}
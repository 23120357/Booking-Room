'use client';

import React, { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { adminService } from '@/services/adminService';
import { formatCurrency } from '@/utils/formatCurrency';
import { getRoomFallbackImage } from '@/utils/imageFallback';
import { exportToCsv } from '@/utils/exportCsv';
import { Search, Filter, AlertCircle, FileText, Download, Copy } from 'lucide-react';
import TransactionDetailModal from '@/components/admin/TransactionDetailModal';
import { useTranslation } from '@/context/LanguageContext';

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  }
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isDisbursing, setIsDisbursing] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setTransactions([]);
      await new Promise(resolve => setTimeout(resolve, 300));
      const res = await adminService.getTransactions({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: filterStatus === 'ALL' ? undefined : filterStatus
      });
      setTransactions(res.items);
      setPagination({ total: res.pagination?.total || 0, totalPages: res.pagination?.totalPages || Math.ceil((res.pagination?.total || 0) / limit) || 1 });
      setError(null);
    } catch (err: any) {
      setError(err.message || t.admin.transactionsPage.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus, page, limit, debouncedSearch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleExport = () => {
    if (!transactions.length) return;
    const exportData = transactions.map(txn => ({
      'Mã GD': txn.transaction_id,
      'Người dùng': txn.tenant_name,
      'Email': txn.tenant_email,
      'Phòng': txn.room_title,
      'Số tiền': txn.amount,
      'Phương thức': txn.payment_method,
      'Thời gian': new Date(txn.created_at).toLocaleString('vi-VN'),
      'Trạng thái': txn.status === 'SUCCESS' ? 'Thành công' : txn.status === 'PENDING' ? 'Đang xử lý' : 'Từ chối',
    }));
    exportToCsv('danh_sach_giao_dich.csv', exportData);
  };

  const handleDisburse = async (transactionId: string) => {
    try {
      setIsDisbursing(true);
      await adminService.disburseTransaction(transactionId);
      showToast(t.admin.transactionsPage.disburseSuccess, 'success');
      // Update local state without refetching immediately
      setTransactions(prev => prev.map(txn => 
        txn.transaction_id === transactionId ? { ...txn, is_disbursed: true } : txn
      ));
      if (selectedTransaction?.transaction_id === transactionId) {
        setSelectedTransaction({ ...selectedTransaction, is_disbursed: true });
      }
    } catch (err: any) {
      showToast(err.message || t.admin.transactionsPage.disburseError, 'error');
    } finally {
      setIsDisbursing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <AdminHeader
        title={t.admin.transactionsPage.title}
        description={t.admin.transactionsPage.description}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.admin.transactionsPage.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-primary/20 focus:border-booking-primary transition-all text-sm shadow-sm"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            {loading && transactions.length > 0 && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-booking-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-4 py-1.5 font-medium rounded-md text-sm transition-colors ${filterStatus === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {t.admin.transactionsPage.filterAll}
              </button>
              <button
                onClick={() => setFilterStatus('SUCCESS')}
                className={`px-4 py-1.5 font-medium rounded-md text-sm transition-colors ${filterStatus === 'SUCCESS' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {t.admin.transactionsPage.filterSuccess}
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`px-4 py-1.5 font-medium rounded-md text-sm transition-colors ${filterStatus === 'PENDING' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {t.admin.transactionsPage.filterPending}
              </button>
              <button
                onClick={() => setFilterStatus('FAILED')}
                className={`px-4 py-1.5 font-medium rounded-md text-sm transition-colors ${filterStatus === 'FAILED' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {t.admin.transactionsPage.filterFailed}
              </button>
            </div>
            
            <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm ml-2">
              <Download size={18} className="text-slate-500" />
              <span>{t.admin.transactionsPage.exportBtn}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="px-6 py-4 font-semibold">{t.admin.transactionsPage.thCode}</th>
                  <th className="px-6 py-4 font-semibold">{t.admin.transactionsPage.thUser}</th>
                  <th className="px-6 py-4 font-semibold">{t.admin.transactionsPage.thRoom}</th>
                  <th className="px-6 py-4 font-semibold">{t.admin.transactionsPage.thAmount}</th>
                  <th className="px-6 py-4 font-semibold">{t.admin.transactionsPage.thMethod}</th>
                  <th className="px-6 py-4 font-semibold">{t.admin.transactionsPage.thTime}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t.admin.transactionsPage.thStatus}</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 text-sm transition-opacity duration-200 ${loading && transactions.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-booking-primary border-t-transparent rounded-full animate-spin"></div></div>
                      {t.admin.transactionsPage.loadingList}
                    </td>
                  </tr>
                ) : !loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      {t.admin.transactionsPage.noTransactionsFound}
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr 
                      key={txn.transaction_id} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTransaction(txn)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <FileText size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900" title={txn.transaction_id}>#{txn.transaction_id.substring(0, 8)}...</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(txn.transaction_id);
                                  showToast(t.admin.transactionsPage.copied, 'success');
                                }}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                title={t.admin.transactionsPage.copyTooltip}
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{txn.tenant_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{txn.tenant_email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            <img
                              src={getRoomFallbackImage(txn.room_id || 'tx', txn.room_cover_image_url)}
                              alt="Room"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 line-clamp-1 text-sm max-w-[200px]" title={txn.room_title}>{txn.room_title || 'N/A'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{t.admin.transactionsPage.roomDeposit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{formatCurrency(txn.amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {txn.payment_method === 'VNPAY' ? 'VNPay' : txn.payment_method === 'MOMO' ? 'MoMo' : txn.payment_method === 'BANK_TRANSFER' ? t.admin.transactionsPage.bankTransfer : txn.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(txn.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {txn.status === 'SUCCESS' ? (
                          <div className={`inline-flex items-center rounded-full border p-[3px] shadow-sm transition-colors ${txn.is_disbursed ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-orange-50'}`}>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white shadow-sm text-emerald-700 border border-slate-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {t.admin.transactionsPage.successStatus}
                            </span>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${txn.is_disbursed ? 'text-emerald-700' : 'text-orange-700'}`}>
                              {txn.is_disbursed ? t.admin.transactionsPage.disbursed : t.admin.transactionsPage.pendingDisbursement}
                            </span>
                          </div>
                        ) : (
                          <StatusBadge status={txn.status === 'PENDING' ? t.admin.transactionsPage.pendingStatus : t.admin.transactionsPage.failedStatus} />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && transactions.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-sm">
              <span className="text-slate-500">{t.admin.transactionsPage.showingCount.replace('{{count}}', transactions.length.toString()).replace('{{total}}', pagination.total.toString())}</span>
              <div className="flex gap-1 items-center">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t.admin.transactionsPage.prevPage}
                </button>
                <span className="px-2 font-medium text-slate-900">
                  {t.admin.transactionsPage.pageText.replace('{{page}}', page.toString()).replace('{{totalPages}}', pagination.totalPages.toString())}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t.admin.transactionsPage.nextPage}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDisburse={handleDisburse}
        isDisbursing={isDisbursing}
      />
    </div>
  );
}


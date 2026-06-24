'use client';

import React, { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminService } from '@/services/adminService';
import { formatCurrency } from '@/utils/formatCurrency';
import { getRoomFallbackImage } from '@/utils/imageFallback';
import { AlertCircle, FileText, Wallet, ArrowDownLeft, ArrowUpRight, MapPin } from 'lucide-react';

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [totals, setTotals] = useState({ totalReceived: 0, totalAdminIncome: 0 });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      // Force recompile
      const res = await adminService.getIncomes({
        page,
        limit,
        status: filterStatus === 'ALL' ? undefined : filterStatus
      });
      setIncomes(res.items);
      setTotals(res.totals || { totalReceived: 0, totalAdminIncome: 0 });
      setPagination({ total: res.pagination?.total || 0, totalPages: res.pagination?.totalPages || Math.ceil((res.pagination?.total || 0) / limit) || 1 });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách thu nhập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [filterStatus, page, limit]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <AdminHeader
        title="Ví thu nhập"
        description="Theo dõi doanh thu và trạng thái giải ngân của nền tảng."
      />

      <div className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 shadow-sm border border-red-100">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ArrowDownLeft size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Số tiền đã nhận</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totals.totalReceived)}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Số tiền thực nhận (Lợi nhuận)</p>
              <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totals.totalAdminIncome)}</h3>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-1.5 font-medium rounded-md text-sm transition-colors ${filterStatus === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus('PENDING_DISBURSEMENT')}
              className={`px-4 py-1.5 font-medium rounded-md text-sm transition-colors ${filterStatus === 'PENDING_DISBURSEMENT' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Chờ giải ngân
            </button>
            <button
              onClick={() => setFilterStatus('DISBURSED')}
              className={`px-4 py-1.5 font-medium rounded-md text-sm transition-colors ${filterStatus === 'DISBURSED' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Đã giải ngân
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="px-6 py-4 font-semibold">Mã Thu Nhập</th>
                  <th className="px-6 py-4 font-semibold">Mã Giao Dịch</th>
                  <th className="px-6 py-4 font-semibold">Phòng</th>
                  <th className="px-6 py-4 font-semibold text-right">Doanh thu Admin</th>
                  <th className="px-6 py-4 font-semibold">Thời gian tạo</th>
                  <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 text-sm transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading && incomes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-booking-primary border-t-transparent rounded-full animate-spin"></div></div>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : !loading && incomes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Không tìm thấy dữ liệu thu nhập nào.
                    </td>
                  </tr>
                ) : (
                  incomes.map((inc) => (
                    <tr key={inc.admin_income_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-800 font-medium" title={inc.admin_income_id}>
                          <Wallet size={16} className="text-booking-primary" />
                          #{inc.admin_income_id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500" title={inc.transaction_id}>
                          <FileText size={16} />
                          #{inc.transaction_id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            <img
                              src={getRoomFallbackImage(inc.room_id || 'inc', inc.room_cover_image_url)}
                              alt="Room"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 line-clamp-1 text-sm max-w-[200px]" title={inc.room_title}>{inc.room_title || 'N/A'}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin size={10} /> ID: {inc.room_id || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-600 text-[15px]">
                          {formatCurrency(inc.income)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(inc.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${inc.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                          {inc.status === 'DISBURSED' ? 'Đã giải ngân' : 'Chờ giải ngân'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && incomes.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-sm">
              <span className="text-slate-500">Hiển thị {incomes.length} trên tổng <span className="font-medium text-slate-900">{pagination.total}</span></span>
              <div className="flex gap-1 items-center">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Trước
                </button>
                <span className="px-3 font-medium text-slate-900">
                  Trang {page} / {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

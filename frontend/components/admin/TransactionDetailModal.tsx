'use client';

import React from 'react';
import { X, CheckCircle, XCircle, Clock, FileText, CreditCard, Calendar, User, MapPin } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { getRoomFallbackImage } from '@/utils/imageFallback';
import { useTranslation } from '@/context/LanguageContext';

interface TransactionDetailModalProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
  onDisburse?: (transactionId: string) => void;
  isDisbursing?: boolean;
}

export default function TransactionDetailModal({ transaction, isOpen, onClose, onDisburse, isDisbursing }: TransactionDetailModalProps) {
  const { t } = useTranslation();
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t.admin.transactionDetailModal.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{t.admin.transactionDetailModal.txCode.replace('{{id}}', transaction.transaction_id)}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl flex items-center gap-3 mb-8 ${
            transaction.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
            transaction.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
            'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {transaction.status === 'SUCCESS' ? <CheckCircle size={24} /> :
             transaction.status === 'PENDING' ? <Clock size={24} /> :
             <XCircle size={24} />}
            <div>
              <p className="font-bold flex items-center gap-2">
                {transaction.status === 'SUCCESS' ? t.admin.transactionDetailModal.successTitle :
                 transaction.status === 'PENDING' ? t.admin.transactionDetailModal.pendingTitle :
                 t.admin.transactionDetailModal.failedTitle}
                
                {transaction.status === 'SUCCESS' && transaction.is_disbursed && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">{t.admin.transactionDetailModal.disbursedBadge}</span>
                )}
                {transaction.status === 'SUCCESS' && !transaction.is_disbursed && (
                  <span className="bg-orange-100 text-orange-800 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">{t.admin.transactionDetailModal.pendingDisburseBadge}</span>
                )}
              </p>
              <p className="text-sm opacity-80 mt-0.5">
                {t.admin.transactionDetailModal.atTime.replace('{{time}}', new Date(transaction.created_at).toLocaleString('vi-VN'))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Amount & Method */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.admin.transactionDetailModal.paymentInfo}</h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-2"><CreditCard size={16} /> {t.admin.transactionDetailModal.method}</span>
                    <span className="font-semibold text-slate-800">
                      {transaction.payment_method === 'VNPAY' ? 'VNPay' : 
                       transaction.payment_method === 'MOMO' ? 'MoMo' : 
                       transaction.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 
                       transaction.payment_method || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 border-dashed">
                    <span className="text-slate-500 flex items-center gap-2"><FileText size={16} /> {t.admin.transactionDetailModal.txType}</span>
                    <span className="font-semibold text-slate-800">
                      {transaction.transaction_type === 'DEPOSIT' ? t.admin.transactionDetailModal.typeDeposit : transaction.transaction_type || t.admin.transactionDetailModal.typePayment}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 border-dashed">
                    <span className="text-slate-500 flex items-center gap-2"><Calendar size={16} /> {t.admin.transactionDetailModal.amount}</span>
                    <span className="text-xl font-bold text-booking-primary">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.admin.transactionDetailModal.tenantTitle}</h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {transaction.tenant_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{transaction.tenant_name || 'N/A'}</p>
                      <p className="text-sm text-slate-500">{transaction.tenant_email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.admin.transactionDetailModal.roomTitle}</h3>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <div className="h-32 w-full bg-slate-200 relative">
                  <img
                    src={getRoomFallbackImage(transaction.room_id || 'tx', transaction.room_cover_image_url)}
                    alt="Room Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-bold line-clamp-1">{transaction.room_title || 'N/A'}</p>
                    <p className="text-white/80 text-xs mt-1 flex items-center gap-1"><MapPin size={12} /> {t.admin.transactionDetailModal.roomId.replace('{{id}}', transaction.room_id || 'N/A')}</p>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.admin.transactionDetailModal.roomNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl mt-auto">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            {t.admin.transactionDetailModal.closeBtn}
          </button>
          
          {transaction.status === 'SUCCESS' && !transaction.is_disbursed && (
            <button
              onClick={() => onDisburse?.(transaction.transaction_id)}
              disabled={isDisbursing}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-booking-primary hover:bg-booking-primary-dark transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isDisbursing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.admin.transactionDetailModal.processing}
                </>
              ) : (
                t.admin.transactionDetailModal.disburseBtn
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

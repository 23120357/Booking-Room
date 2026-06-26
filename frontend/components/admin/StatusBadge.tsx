import React from 'react';
import { useTranslation } from '@/context/LanguageContext';

type StatusType = 
  | 'Hoạt động' 
  | 'Bị khóa' 
  | 'Chờ xác thực' 
  | 'Thành công' 
  | 'Đang xử lý' 
  | 'Mở' 
  | 'Đã giải quyết' 
  | 'Chờ duyệt';

interface StatusBadgeProps {
  status: StatusType | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  let colorClasses = 'bg-slate-100 text-slate-700';
  let dotColor = 'bg-slate-400';

  if (['Hoạt động', 'Thành công', 'Đã giải quyết', 'Active', 'Completed', 'Resolved', 'Đã giải ngân', 'Disbursed'].includes(status)) {
    colorClasses = 'bg-emerald-100 text-emerald-700';
    dotColor = 'bg-emerald-500';
  } else if (['Bị khóa', 'Từ chối', 'Locked', 'Rejected'].includes(status)) {
    colorClasses = 'bg-red-100 text-red-700';
    dotColor = 'bg-red-500';
  } else if (['Chờ xác thực', 'Đang xử lý', 'Mở', 'Chờ duyệt', 'Đang chờ', 'Pending Auth', 'Processing', 'Open', 'Pending Approval', 'Waiting', 'Chờ giải ngân', 'Pending Disbursement', 'Chờ xử lý', 'Pending'].includes(status)) {
    colorClasses = 'bg-orange-100 text-orange-700';
    dotColor = 'bg-orange-500';
  } else if (['Đã đóng', 'Closed'].includes(status)) {
    colorClasses = 'bg-slate-200 text-slate-600';
    dotColor = 'bg-slate-400';
  }

  const getLabel = (s: string) => {
    switch (s) {
      case 'Hoạt động':
      case 'Active':
        return t.admin.status.active;
      case 'Bị khóa':
      case 'Locked':
        return t.admin.status.locked;
      case 'Chờ xác thực':
      case 'Pending Auth':
        return t.admin.status.pendingAuth;
      case 'Thành công':
      case 'Completed':
        return t.admin.status.success;
      case 'Đang xử lý':
      case 'Processing':
        return t.admin.status.processing;
      case 'Mở':
      case 'Open':
        return t.admin.status.open;
      case 'Đã giải quyết':
      case 'Resolved':
        return t.admin.status.resolved;
      case 'Chờ duyệt':
      case 'Pending Approval':
        return t.admin.status.pendingApproval;
      case 'Đang chờ':
      case 'Waiting':
        return t.admin.status.waiting;
      case 'Từ chối':
      case 'Rejected':
        return t.admin.status.rejected;
      case 'Đã đóng':
      case 'Closed':
        return t.admin.status.closed;
      case 'Chưa xác thực OTP':
      case 'Unverified OTP':
        return t.admin.status.unverifiedOtp;
      case 'Đã giải ngân':
      case 'Disbursed':
        return t.admin.status.disbursed;
      case 'Chờ giải ngân':
      case 'Pending Disbursement':
        return t.admin.status.pendingDisbursement;
      case 'Chờ xử lý':
      case 'Pending':
        return t.admin.status.pendingProcessing;
      default:
        return s;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {getLabel(status)}
    </span>
  );
}

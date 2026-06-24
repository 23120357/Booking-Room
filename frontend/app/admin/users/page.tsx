'use client';

import React, { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { adminService } from '@/services/adminService';
import { User } from '@/types/user';
import { exportToCsv } from '@/utils/exportCsv';
import { Users, UserCheck, UserX, UserMinus, Search, Download, Eye, Lock, Unlock, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserDetailModal from '@/components/admin/UserDetailModal';
import Avatar from '@/components/admin/Avatar';
import { useTranslation } from '@/context/LanguageContext';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, hostTotal: 0, bannedTotal: 0, pendingTotal: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [statsLoading, setStatsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filterStatus changes (separate from search debounce)
  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsRes = await adminService.getUserStats();
      setStats(statsRes);
    } catch (err: any) {
      console.error('Failed to load user stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setUsers([]);
      await new Promise(resolve => setTimeout(resolve, 300));
      setError(null);
      const usersRes = await adminService.getUsers({ 
        page, 
        limit, 
        search: debouncedSearch || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      });
      setUsers(usersRes.items);
      setPagination({ total: usersRes.pagination?.total || 0, totalPages: usersRes.pagination?.totalPages || 1 });
    } catch (err: any) {
      console.error('Failed to load user management data:', err);
      toast.error(err.message || t.admin.usersPage.loadError);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, limit, debouncedSearch, filterStatus]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleToggleLock = async (userId: string, currentStatus: string) => {
    try {
      setActionLoading(userId);
      if (currentStatus === 'BANNED') {
        await adminService.unlockUser(userId);
        toast.success(t.admin.usersPage.unlockSuccess);
      } else {
        await adminService.lockUser(userId);
        toast.success(t.admin.usersPage.lockSuccess);
      }
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || t.admin.usersPage.statusChangeError);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    if (!users.length) return;
    const exportData = users.map(u => ({
      'ID': u.userId,
      'Email': u.email,
      'Họ và tên': u.fullName,
      'Số điện thoại': u.phoneNumber || 'N/A',
      'Vai trò': u.role === 'ADMIN' ? 'Quản trị viên' : u.role === 'HOST' ? 'Chủ nhà' : 'Người thuê',
      'Ngày tham gia': u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A',
      'Trạng thái': u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'
    }));
    exportToCsv('danh_sach_nguoi_dung.csv', exportData);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <AdminHeader
        title={t.admin.usersPage.title}
        description={t.admin.usersPage.description}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t.admin.usersPage.totalAccountsCard}
            value={stats.total}
            icon={Users}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            loading={statsLoading}
          />
          <StatCard
            title={t.admin.usersPage.hostAccountsCard}
            value={stats.hostTotal}
            icon={UserCheck}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            loading={statsLoading}
          />
          <StatCard
            title={t.admin.usersPage.lockedAccountsCard}
            value={stats.bannedTotal}
            icon={UserX}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
            loading={statsLoading}
          />
          <StatCard
            title={t.admin.usersPage.pendingAccountsCard}
            value={stats.pendingTotal}
            icon={UserMinus}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            loading={statsLoading}
          />
        </div>

        {/* Main content grid */}
        <div className="flex flex-col gap-6">

          {/* Left Column - User List (2/3 width) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.admin.usersPage.searchPlaceholder}
                    className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-primary/20 focus:border-booking-primary transition-all text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  {loading && users.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-booking-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-primary/20 focus:border-booking-primary text-sm font-medium cursor-pointer"
                    >
                      <option value="ALL">{t.admin.usersPage.filterAll}</option>
                      <option value="ACTIVE">{t.admin.usersPage.filterActive}</option>
                      <option value="BANNED">{t.admin.usersPage.filterBanned}</option>
                      <option value="INACTIVE">{t.admin.usersPage.filterInactive}</option>
                    </select>
                    <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {/* Nút Xuất danh sách chuyển xuống đây */}
                  <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ml-2">
                    <Download size={18} className="text-slate-500" />
                    <span>{t.admin.usersPage.exportBtn}</span>
                  </button>
                </div>
              </div>
              {/* Table */}
              <div className="overflow-x-auto flex-1 min-h-[500px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                      <th className="px-6 py-4 font-semibold">{t.admin.usersPage.thUser}</th>
                      <th className="px-6 py-4 font-semibold">{t.admin.usersPage.thContact}</th>
                      <th className="px-6 py-4 font-semibold">{t.admin.usersPage.thRole}</th>
                      <th className="px-6 py-4 font-semibold">{t.admin.usersPage.thStatus}</th>
                      <th className="px-6 py-4 font-semibold">{t.admin.usersPage.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className={`text-sm divide-y divide-slate-100 transition-opacity duration-200 ${loading && users.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                    {loading && users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center">
                            <span className="w-6 h-6 border-2 border-booking-primary border-t-transparent rounded-full animate-spin mb-2"></span>
                            {t.admin.usersPage.loadingList}
                          </div>
                        </td>
                      </tr>
                    ) : !loading && users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          {t.admin.usersPage.noUsersFound}
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar 
                                src={user.avatarUrl} 
                                alt={user.fullName} 
                                fallbackText={user.fullName} 
                                className="w-10 h-10"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{user.fullName}</p>
                                <p className="text-xs text-slate-500">@{user.username || user.userId.substring(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-900">{user.email}</p>
                            {user.phoneNumber && <p className="text-xs text-slate-500">{user.phoneNumber}</p>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'HOST' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-700'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge
                              status={
                                user.status === 'ACTIVE'
                                  ? (user.approvalStatus === 'PENDING' ? t.admin.status.pendingAuth : t.admin.status.active)
                                  : user.status === 'BANNED' ? t.admin.status.locked
                                  : user.status === 'INACTIVE' ? t.admin.status.unverifiedOtp : t.admin.status.locked
                              }
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setViewingUserId(user.userId)}
                                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                title={t.admin.usersPage.viewDetailTooltip}
                              >
                                <Eye size={16} />
                              </button>
                              {user.role !== 'ADMIN' && user.approvalStatus !== 'PENDING' && (
                                <button 
                                  onClick={() => handleToggleLock(user.userId, user.status)}
                                  disabled={actionLoading === user.userId}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${user.status === 'BANNED' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                  title={user.status === 'BANNED' ? t.admin.usersPage.unlockTooltip : t.admin.usersPage.lockTooltip}
                                >
                                  {actionLoading === user.userId ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  ) : user.status === 'BANNED' ? (
                                    <Unlock size={16} />
                                  ) : (
                                    <Lock size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-sm text-slate-500">
                <span>{t.admin.usersPage.showingCount.replace('{{count}}', users.length.toString()).replace('{{total}}', pagination.total.toString())}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t.admin.usersPage.prevPage}
                  </button>
                  <span className="px-2 font-medium text-slate-900">
                    {t.admin.usersPage.pageText.replace('{{page}}', page.toString()).replace('{{totalPages}}', pagination.totalPages.toString())}
                  </span>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t.admin.usersPage.nextPage}
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>

      <UserDetailModal
        userId={viewingUserId || ''}
        isOpen={!!viewingUserId}
        onClose={() => setViewingUserId(null)}
        onStatusChange={() => fetchUsers()}
      />
    </div>
  );
}


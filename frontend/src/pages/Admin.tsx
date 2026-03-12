import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, CircleDollarSign, Crown, PencilLine, Search, ShieldCheck, SlidersHorizontal, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllUsers } from '@/hooks/useAPI';
import { API, type AdminUpdateUserPayload } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { User } from '@/types/User';

type EditableUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  location: string;
  bio: string;
  denomination: string;
  onboardingCompleted: boolean;
  isActive: boolean;
  subscriptionStatus: 'active' | 'pending' | 'inactive';
  subscriptionTier: 'free' | 'premium' | 'elite';
  subscriptionBillingCycle: 'monthly' | 'quarterly';
};

type EditableSource = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  age?: number;
  gender?: string;
  location?: string;
  bio?: string;
  denomination?: string;
  onboardingCompleted?: boolean;
  isActive?: boolean;
  subscriptionStatus?: string;
  subscriptionTier?: string;
  subscriptionBillingCycle?: string;
};

const normalizeEditableGender = (value: unknown): 'MALE' | 'FEMALE' => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return normalized === 'FEMALE' ? 'FEMALE' : 'MALE';
};

const isAdminRole = (role: string | undefined) => (role || '').trim().toLowerCase() === 'admin';

const toEditableUser = (user: EditableSource): EditableUser => ({
  id: user.id,
  name: user.name || '',
  email: user.email || '',
  role: (user.role || 'user') as 'user' | 'admin' | string,
  age: typeof user.age === 'number' ? user.age : 18,
  gender: normalizeEditableGender(user.gender),
  location: user.location || '',
  bio: user.bio || '',
  denomination: typeof user.denomination === 'string' ? user.denomination : '',
  onboardingCompleted: Boolean(user.onboardingCompleted),
  isActive: user.isActive !== false,
  subscriptionStatus:
    user.subscriptionStatus === 'active' || user.subscriptionStatus === 'pending' || user.subscriptionStatus === 'inactive'
      ? user.subscriptionStatus
      : 'inactive',
  subscriptionTier:
    user.subscriptionTier === 'premium' || user.subscriptionTier === 'elite' || user.subscriptionTier === 'free'
      ? user.subscriptionTier
      : 'free',
  subscriptionBillingCycle: user.subscriptionBillingCycle === 'quarterly' ? 'quarterly' : 'monthly',
});

const AdminPage = () => {
  const { showError, showSuccess, showInfo } = useToast();
  const [activeSection, setActiveSection] = useState<'users' | 'payments' | 'reports' | 'features'>('users');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [passportModeEnabled, setPassportModeEnabled] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(true);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [supportTickets, setSupportTickets] = useState<Awaited<ReturnType<typeof API.Support.getTickets>>['tickets']>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [paymentAnalytics, setPaymentAnalytics] = useState<Awaited<ReturnType<typeof API.Payment.getAdminAnalytics>> | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive' | 'unknown'>('all');
  const [paymentTierFilter, setPaymentTierFilter] = useState<'all' | 'premium' | 'elite' | 'free'>('all');
  const [paymentCycleFilter, setPaymentCycleFilter] = useState<'all' | 'monthly' | 'quarterly'>('all');
  const [paymentSort, setPaymentSort] = useState<'latest' | 'oldest' | 'amount-high' | 'amount-low' | 'name-az'>('latest');
  const [deletingPaymentUserId, setDeletingPaymentUserId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      try {
        const [settingsResponse, issuesResponse, paymentsResponse] = await Promise.all([
          API.User.getFeatureSettings(),
          API.Support.getTickets(),
          API.Payment.getAdminAnalytics(),
        ]);

        if (isMounted) {
          setPassportModeEnabled(Boolean(settingsResponse.passportModeEnabled));
          setSupportTickets(Array.isArray(issuesResponse.tickets) ? issuesResponse.tickets : []);
          setPaymentAnalytics(paymentsResponse);
        }
      } catch (settingsError) {
        const message =
          settingsError instanceof Error && settingsError.message
            ? settingsError.message
            : 'Failed to load admin data.';
        showError(message);
      } finally {
        if (isMounted) {
          setFeatureLoading(false);
          setIssuesLoading(false);
          setPaymentsLoading(false);
        }
      }
    };

    void loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const { data, loading, error, refetch } = useAllUsers({ page: 1, limit: 200, search: debouncedSearch });

  const users = useMemo(() => data?.users || [], [data?.users]);
  const stats = useMemo(() => {
    const total = data?.total ?? users.length;
    const admins = users.filter((user) => String(user.role || 'user').toLowerCase() === 'admin').length;
    const premium = users.filter((user) => user.subscriptionStatus === 'active').length;
    const completedOnboarding = users.filter((user) => user.onboardingCompleted).length;
    const tickets = supportTickets.length;
    const paymentRecords = paymentAnalytics?.summary.totalRecords ?? 0;
    return { total, admins, premium, completedOnboarding, tickets, paymentRecords };
  }, [data?.total, paymentAnalytics?.summary.totalRecords, supportTickets.length, users]);

  const filteredPaymentRecords = useMemo(() => {
    const records = paymentAnalytics?.records || [];
    const normalizedSearch = paymentSearch.trim().toLowerCase();

    const filtered = records.filter((record) => {
      if (paymentStatusFilter !== 'all' && record.status !== paymentStatusFilter) return false;
      if (paymentTierFilter !== 'all' && record.tier !== paymentTierFilter) return false;
      if (paymentCycleFilter !== 'all' && record.billingCycle !== paymentCycleFilter) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        record.name,
        record.email,
        record.reference,
        record.tier,
        record.status,
        record.pricingRegion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });

    const sorted = [...filtered];
    sorted.sort((left, right) => {
      if (paymentSort === 'name-az') {
        return left.name.localeCompare(right.name);
      }
      if (paymentSort === 'amount-high') {
        return right.chargeAmountMajor - left.chargeAmountMajor;
      }
      if (paymentSort === 'amount-low') {
        return left.chargeAmountMajor - right.chargeAmountMajor;
      }

      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
      return paymentSort === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
    });

    return sorted;
  }, [
    paymentAnalytics?.records,
    paymentCycleFilter,
    paymentSearch,
    paymentSort,
    paymentStatusFilter,
    paymentTierFilter,
  ]);

  const openEditor = (user: User) => {
    const editable = toEditableUser(user);
    setSelectedUser(editable);
    setEditingUser(editable);
  };

  const closeEditor = () => {
    if (saving || deletingUser || resettingPassword) return;
    setSelectedUser(null);
    setEditingUser(null);
  };

  const updateEditingField = <K extends keyof EditableUser>(field: K, value: EditableUser[K]) => {
    setEditingUser((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSave = async () => {
    if (!selectedUser || !editingUser) return;

    const payload: AdminUpdateUserPayload = {
      name: editingUser.name.trim(),
      email: editingUser.email.trim().toLowerCase(),
      role: isAdminRole(selectedUser.role) ? undefined : editingUser.role === 'admin' ? 'admin' : 'user',
      age: Number(editingUser.age),
      gender: editingUser.gender,
      location: editingUser.location.trim(),
      bio: editingUser.bio.trim(),
      denomination: editingUser.denomination.trim(),
      onboardingCompleted: Boolean(editingUser.onboardingCompleted),
      isActive: Boolean(editingUser.isActive),
      subscriptionStatus: editingUser.subscriptionStatus,
      subscriptionTier: editingUser.subscriptionTier,
      subscriptionBillingCycle: editingUser.subscriptionBillingCycle,
    };

    try {
      setSaving(true);
      const response = await API.User.adminUpdateUser(selectedUser.id, payload);
      showSuccess(response.message || 'User updated successfully.');
      await refetch();
      const refreshed = toEditableUser(response.user);
      setSelectedUser(refreshed);
      setEditingUser(refreshed);
    } catch (saveError) {
      const message =
        saveError instanceof Error && saveError.message
          ? saveError.message
          : 'Failed to update user.';
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      setResettingPassword(true);
      const response = await API.User.adminResetPassword(selectedUser.id);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(response.resetLink);
        showSuccess('Password reset link generated and copied to clipboard.');
      } else {
        showInfo(response.resetLink, 'Password reset link');
      }
    } catch (resetError) {
      const message =
        resetError instanceof Error && resetError.message
          ? resetError.message
          : 'Failed to generate password reset link.';
      showError(message);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const confirmed = window.confirm(`Delete ${selectedUser.name || selectedUser.email}? This removes the account permanently.`);
    if (!confirmed) return;

    try {
      setDeletingUser(true);
      const response = await API.User.adminDeleteUser(selectedUser.id);
      showSuccess(response.message || 'User deleted successfully.');
      closeEditor();
      await refetch();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error && deleteError.message
          ? deleteError.message
          : 'Failed to delete user.';
      showError(message);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleTogglePassportMode = async () => {
    try {
      setFeatureSaving(true);
      const response = await API.User.updateFeatureSettings({
        passportModeEnabled: !passportModeEnabled,
      });
      setPassportModeEnabled(Boolean(response.passportModeEnabled));
      showSuccess(response.message || 'Feature settings updated.');
    } catch (toggleError) {
      const message =
        toggleError instanceof Error && toggleError.message
          ? toggleError.message
          : 'Failed to update Passport Mode.';
      showError(message);
    } finally {
      setFeatureSaving(false);
    }
  };

  const reloadPaymentAnalytics = async () => {
    const paymentsResponse = await API.Payment.getAdminAnalytics();
    setPaymentAnalytics(paymentsResponse);
  };

  const handleDeletePaymentRecord = async (userId: string, userLabel: string) => {
    const confirmed = window.confirm(`Delete the stored payment record for ${userLabel}? This clears the current subscription/payment data from admin records.`);
    if (!confirmed) return;

    try {
      setDeletingPaymentUserId(userId);
      const response = await API.Payment.deleteAdminRecord(userId);
      await reloadPaymentAnalytics();
      await refetch();
      showSuccess(response.message || 'Payment record deleted successfully.');
    } catch (deleteError) {
      const message =
        deleteError instanceof Error && deleteError.message
          ? deleteError.message
          : 'Failed to delete payment record.';
      showError(message);
    } finally {
      setDeletingPaymentUserId(null);
    }
  };

  const formatReportedAt = (value: string | null) => {
    if (!value) return 'Unknown time';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Unknown time';
    return parsed.toLocaleString();
  };

  const formatMoney = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'NGN',
        maximumFractionDigits: currency === 'NGN' ? 0 : 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.18),_transparent_40%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] px-3 py-6 text-white sm:px-6 sm:py-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">FaithBliss Admin Console</h1>
            <p className="mt-2 text-sm text-gray-300">Full platform access for account management and user administration.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          <div className="grid min-w-max grid-flow-col gap-4 sm:min-w-0 sm:grid-flow-row sm:grid-cols-2 xl:grid-cols-5">
          <div className="w-[220px] rounded-3xl border border-white/10 bg-white/5 p-5 sm:w-auto">
            <div className="flex items-center gap-3 text-cyan-200">
              <Users className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">Total users</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="w-[220px] rounded-3xl border border-white/10 bg-white/5 p-5 sm:w-auto">
            <div className="flex items-center gap-3 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">Admins</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.admins}</p>
          </div>
          <div className="w-[220px] rounded-3xl border border-white/10 bg-white/5 p-5 sm:w-auto">
            <div className="flex items-center gap-3 text-yellow-200">
              <Crown className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">Active premium</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.premium}</p>
          </div>
          <div className="w-[220px] rounded-3xl border border-white/10 bg-white/5 p-5 sm:w-auto">
            <div className="flex items-center gap-3 text-pink-200">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">Completed onboarding</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.completedOnboarding}</p>
          </div>
          <div className="w-[220px] rounded-3xl border border-white/10 bg-white/5 p-5 sm:w-auto">
            <div className="flex items-center gap-3 text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">Support inbox</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stats.tickets}</p>
          </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-3 sm:p-4 lg:sticky lg:top-8 lg:h-fit">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Admin navigation</p>
            <div className="mt-4 grid grid-cols-2 gap-2 lg:block lg:space-y-2">
              <button
                type="button"
                onClick={() => setActiveSection('users')}
                className={`col-span-2 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition sm:col-span-1 lg:col-span-2 ${
                  activeSection === 'users' ? 'bg-cyan-500/15 text-cyan-200' : 'bg-black/20 text-gray-200 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">User directory</span>
                </span>
                <span className="text-xs text-gray-400">{stats.total}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('payments')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  activeSection === 'payments' ? 'bg-yellow-500/15 text-yellow-200' : 'bg-black/20 text-gray-200 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <CircleDollarSign className="h-4 w-4" />
                  <span className="font-medium">Payments</span>
                </span>
                <span className="text-xs text-gray-400">{stats.paymentRecords}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('reports')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  activeSection === 'reports' ? 'bg-orange-500/15 text-orange-200' : 'bg-black/20 text-gray-200 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Support inbox</span>
                </span>
                <span className="text-xs text-gray-400">{stats.tickets}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('features')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  activeSection === 'features' ? 'bg-violet-500/15 text-violet-200' : 'bg-black/20 text-gray-200 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="font-medium">Feature control</span>
                </span>
              </button>
            </div>
          </aside>

          <div className="space-y-6">
            {activeSection === 'features' ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">Feature control</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Passport Mode</h2>
                    <p className="mt-2 max-w-2xl text-sm text-gray-400">
                      Controls whether premium users can target any country and be discoverable only within that selected country.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Status</p>
                      <p className={`text-sm font-semibold ${passportModeEnabled ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {featureLoading ? 'Loading...' : passportModeEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleTogglePassportMode()}
                      disabled={featureLoading || featureSaving}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                        passportModeEnabled
                          ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20'
                          : 'bg-violet-500/15 text-violet-200 hover:bg-violet-500/20'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {featureSaving
                        ? 'Updating...'
                        : passportModeEnabled
                          ? 'Disable Passport Mode'
                          : 'Enable Passport Mode'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === 'users' ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">User directory</h2>
                    <p className="mt-1 text-sm text-gray-400">All users, including admins and incomplete profiles. Edit any user from one control point.</p>
                  </div>

                  <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, email, or location"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    />
                  </label>
                </div>

                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-gray-300">
                    Loading admin data...
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-200">
                    {error}
                  </div>
                ) : users.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-gray-300">
                    No users available.
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 lg:hidden">
                      {users.map((user) => (
                        <div key={user.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                          <div className="flex flex-col gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-lg font-semibold text-white">{user.name}</p>
                              <p className="truncate text-xs text-gray-400">{user.email}</p>
                            </div>
                            <button
                              onClick={() => openEditor(user)}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Edit User
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Role</p>
                                <p className="mt-1 text-sm text-white">{String(user.role || 'user')}</p>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Status</p>
                                <p className={`mt-1 text-sm font-medium ${user.isActive === false ? 'text-red-200' : 'text-emerald-200'}`}>
                                  {user.isActive === false ? 'Inactive' : 'Active'}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Plan</p>
                                <p className={`mt-1 text-sm font-medium ${user.subscriptionStatus === 'active' ? 'text-yellow-200' : 'text-gray-200'}`}>
                                  {user.subscriptionStatus === 'active' ? 'Premium' : 'Free'}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Location</p>
                                <p className="mt-1 line-clamp-2 text-sm text-white">{user.location || 'Unknown'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hidden overflow-x-auto rounded-2xl border border-white/10 lg:block">
                    <div className="min-w-[980px]">
                      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] gap-4 bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                        <span>User</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span>Plan</span>
                        <span>Location</span>
                        <span>Action</span>
                      </div>
                      <div className="divide-y divide-white/10">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] gap-4 px-4 py-4 text-sm text-gray-200"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{user.name}</p>
                              <p className="truncate text-xs text-gray-400">{user.email}</p>
                            </div>
                            <div>
                              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
                                {String(user.role || 'user')}
                              </span>
                            </div>
                            <div>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                user.isActive === false ? 'bg-red-500/15 text-red-200' : 'bg-emerald-500/15 text-emerald-200'
                              }`}>
                                {user.isActive === false ? 'Inactive' : 'Active'}
                              </span>
                            </div>
                            <div>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                user.subscriptionStatus === 'active'
                                  ? 'bg-yellow-500/15 text-yellow-200'
                                  : 'bg-white/10 text-gray-300'
                              }`}>
                                {user.subscriptionStatus === 'active' ? 'Premium' : 'Free'}
                              </span>
                            </div>
                            <div className="truncate text-gray-300">{user.location || 'Unknown'}</div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => openEditor(user)}
                                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  </>
                )}
              </div>
            ) : null}

            {activeSection === 'payments' ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-white">Subscription payments</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Monitor active subscriptions, tracked charge volume, billing cycles, and recent subscription records.
                    </p>
                  </div>

                  {paymentsLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-gray-300">
                      Loading payment analytics...
                    </div>
                  ) : !paymentAnalytics ? (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-200">
                      Failed to load payment analytics.
                    </div>
                  ) : (
                    <>
                      <div className="-mx-2 overflow-x-auto px-2 pb-1">
                        <div className="grid min-w-max grid-flow-col gap-4 sm:min-w-0 sm:grid-flow-row sm:grid-cols-2 xl:grid-cols-4">
                          <div className="w-[220px] rounded-3xl border border-white/10 bg-black/20 p-5 sm:w-auto">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Active subscriptions</p>
                            <p className="mt-3 text-3xl font-semibold text-white">{paymentAnalytics.summary.activeSubscriptions}</p>
                          </div>
                          <div className="w-[220px] rounded-3xl border border-white/10 bg-black/20 p-5 sm:w-auto">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Pending subscriptions</p>
                            <p className="mt-3 text-3xl font-semibold text-white">{paymentAnalytics.summary.pendingSubscriptions}</p>
                          </div>
                          <div className="w-[220px] rounded-3xl border border-white/10 bg-black/20 p-5 sm:w-auto">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Active NGN volume</p>
                            <p className="mt-3 text-3xl font-semibold text-white">
                              {formatMoney(paymentAnalytics.summary.activeChargeVolumeNgn, 'NGN')}
                            </p>
                          </div>
                          <div className="w-[220px] rounded-3xl border border-white/10 bg-black/20 p-5 sm:w-auto">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Tracked NGN volume</p>
                            <p className="mt-3 text-3xl font-semibold text-white">
                              {formatMoney(paymentAnalytics.summary.trackedChargeVolumeNgn, 'NGN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Billing cycles</p>
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between text-sm text-gray-200">
                              <span>Monthly</span>
                              <span className="font-semibold text-white">{paymentAnalytics.summary.monthlyPlans}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-200">
                              <span>Quarterly</span>
                              <span className="font-semibold text-white">{paymentAnalytics.summary.quarterlyPlans}</span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Status breakdown</p>
                          <div className="mt-4 space-y-3">
                            {Object.entries(paymentAnalytics.breakdowns.status).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between text-sm text-gray-200">
                                <span className="capitalize">{key}</span>
                                <span className="font-semibold text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Region breakdown</p>
                          <div className="mt-4 space-y-3">
                            {Object.entries(paymentAnalytics.breakdowns.region).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between text-sm text-gray-200">
                                <span className="capitalize">{key}</span>
                                <span className="font-semibold text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Recent subscription records</h3>
                            <p className="mt-1 text-sm text-gray-400">Latest tracked payment and subscription entries across all users.</p>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                            {filteredPaymentRecords.length} of {paymentAnalytics.records.length} records
                          </span>
                        </div>

                        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 md:col-span-2 xl:col-span-2">
                            <Search className="h-4 w-4 shrink-0 text-gray-400" />
                            <input
                              value={paymentSearch}
                              onChange={(event) => setPaymentSearch(event.target.value)}
                              placeholder="Search by user, email, or reference"
                              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                            />
                          </label>
                          <select
                            value={paymentStatusFilter}
                            onChange={(event) => setPaymentStatusFilter(event.target.value as typeof paymentStatusFilter)}
                            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                            <option value="unknown">Unknown</option>
                          </select>
                          <select
                            value={paymentTierFilter}
                            onChange={(event) => setPaymentTierFilter(event.target.value as typeof paymentTierFilter)}
                            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="all">All plans</option>
                            <option value="premium">Premium</option>
                            <option value="elite">Pro</option>
                            <option value="free">Free</option>
                          </select>
                          <select
                            value={paymentCycleFilter}
                            onChange={(event) => setPaymentCycleFilter(event.target.value as typeof paymentCycleFilter)}
                            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="all">All cycles</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">3-Month</option>
                          </select>
                          <select
                            value={paymentSort}
                            onChange={(event) => setPaymentSort(event.target.value as typeof paymentSort)}
                            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none md:col-span-2 xl:col-span-1"
                          >
                            <option value="latest">Sort: Latest</option>
                            <option value="oldest">Sort: Oldest</option>
                            <option value="amount-high">Sort: Amount high-low</option>
                            <option value="amount-low">Sort: Amount low-high</option>
                            <option value="name-az">Sort: Name A-Z</option>
                          </select>
                        </div>

                        {paymentAnalytics.records.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-gray-300">
                            No subscription records tracked yet.
                          </div>
                        ) : filteredPaymentRecords.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-gray-300">
                            No payment records match the current filters.
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4 lg:hidden">
                              {filteredPaymentRecords.map((record) => (
                                <div key={`${record.userId}-${record.reference || record.updatedAt || record.email}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-base font-semibold text-white">{record.name}</p>
                                      <p className="truncate text-xs text-gray-400">{record.email}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                                      record.status === 'active'
                                        ? 'bg-emerald-500/15 text-emerald-200'
                                        : record.status === 'pending'
                                          ? 'bg-yellow-500/15 text-yellow-200'
                                          : 'bg-white/10 text-gray-300'
                                    }`}>
                                      {record.status}
                                    </span>
                                  </div>
                                  <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Plan</p>
                                      <p className="mt-1 text-sm text-white capitalize">{record.tier} • {record.billingCycle}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Charge</p>
                                      <p className="mt-1 text-sm text-white">{formatMoney(record.chargeAmountMajor, record.chargeCurrency)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Shown to user</p>
                                      <p className="mt-1 text-sm text-white">{formatMoney(record.displayAmountMajor, record.displayCurrency)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Region</p>
                                      <p className="mt-1 text-sm text-white capitalize">{record.pricingRegion}</p>
                                    </div>
                                  </div>
                                  <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3 text-xs text-gray-300">
                                    <p className="truncate">Reference: {record.reference || 'N/A'}</p>
                                    <p className="mt-1">Updated: {formatReportedAt(record.updatedAt)}</p>
                                    <p className="mt-1">Next payment: {formatReportedAt(record.nextPaymentDate)}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeletePaymentRecord(record.userId, record.name || record.email)}
                                    disabled={deletingPaymentUserId === record.userId}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {deletingPaymentUserId === record.userId ? 'Deleting...' : 'Delete payment record'}
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="hidden overflow-x-auto rounded-2xl border border-white/10 lg:block">
                              <div className="min-w-[1260px]">
                                <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] gap-4 bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                                  <span>User</span>
                                  <span>Plan</span>
                                  <span>Status</span>
                                  <span>Charge</span>
                                  <span>Shown price</span>
                                  <span>Reference</span>
                                  <span>Action</span>
                                </div>
                                <div className="divide-y divide-white/10">
                                  {filteredPaymentRecords.map((record) => (
                                    <div
                                      key={`${record.userId}-${record.reference || record.updatedAt || record.email}`}
                                      className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] gap-4 px-4 py-4 text-sm text-gray-200"
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate font-semibold text-white">{record.name}</p>
                                        <p className="truncate text-xs text-gray-400">{record.email}</p>
                                      </div>
                                      <div className="text-sm capitalize text-white">{record.tier} • {record.billingCycle}</div>
                                      <div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                          record.status === 'active'
                                            ? 'bg-emerald-500/15 text-emerald-200'
                                            : record.status === 'pending'
                                              ? 'bg-yellow-500/15 text-yellow-200'
                                              : 'bg-white/10 text-gray-300'
                                        }`}>
                                          {record.status}
                                        </span>
                                      </div>
                                      <div className="text-white">{formatMoney(record.chargeAmountMajor, record.chargeCurrency)}</div>
                                      <div className="text-gray-300">{formatMoney(record.displayAmountMajor, record.displayCurrency)}</div>
                                      <div className="min-w-0">
                                        <p className="truncate text-white">{record.reference || 'N/A'}</p>
                                        <p className="truncate text-xs text-gray-400">{formatReportedAt(record.updatedAt)}</p>
                                      </div>
                                      <div className="flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => void handleDeletePaymentRecord(record.userId, record.name || record.email)}
                                          disabled={deletingPaymentUserId === record.userId}
                                          className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          {deletingPaymentUserId === record.userId ? 'Deleting...' : 'Delete'}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {activeSection === 'reports' ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-white">Support inbox</h2>
                  <p className="mt-1 text-sm text-gray-400">All help and report tickets submitted by users. Review ticket type, reporter email, subject, and message content here.</p>
                </div>

                {issuesLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-gray-300">
                    Loading support tickets...
                  </div>
                ) : supportTickets.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-gray-300">
                    No support tickets submitted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supportTickets.map((issue) => (
                      <div key={issue.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${issue.type === 'REPORT' ? 'text-orange-200' : 'text-cyan-200'}`}>
                              {issue.type === 'REPORT' ? 'Reported issue' : 'Help & support'}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-white">{issue.subject || 'No subject provided'}</h3>
                            <p className="mt-1 text-sm text-gray-400">{issue.reporterEmail || 'Unknown reporter email'}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                              issue.type === 'REPORT' ? 'bg-orange-500/15 text-orange-200' : 'bg-cyan-500/15 text-cyan-200'
                            }`}>
                              {issue.type}
                            </span>
                            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
                              {issue.status}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                              {formatReportedAt(issue.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm leading-6 text-gray-200">
                          {issue.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {editingUser && selectedUser ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
          <div className="flex min-h-[100dvh] items-stretch justify-center p-0 sm:min-h-full sm:items-center sm:p-4">
            <div className="flex h-[100dvh] w-full max-w-3xl min-h-0 flex-col overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.98))] text-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]">
              <div className="shrink-0 border-b border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.98))] px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Edit user</p>
                    <h2 className="mt-2 truncate text-2xl font-semibold text-white">{editingUser.name || editingUser.email}</h2>
                    <p className="mt-1 truncate text-sm text-gray-400">{editingUser.email}</p>
                  </div>
                  <button
                    onClick={closeEditor}
                    disabled={saving || deletingUser || resettingPassword}
                    className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Name</span>
                    <input value={editingUser.name} onChange={(e) => updateEditingField('name', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Email</span>
                    <input value={editingUser.email} onChange={(e) => updateEditingField('email', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Role</span>
                    {isAdminRole(selectedUser.role) ? (
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                        <span>Admin</span>
                        <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-200">
                          Locked
                        </span>
                      </div>
                    ) : (
                      <select value={editingUser.role === 'admin' ? 'admin' : 'user'} onChange={(e) => updateEditingField('role', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Age</span>
                    <input type="number" min={18} max={99} value={editingUser.age} onChange={(e) => updateEditingField('age', Number(e.target.value))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Gender</span>
                    <select value={editingUser.gender} onChange={(e) => updateEditingField('gender', normalizeEditableGender(e.target.value))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none">
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Denomination</span>
                    <input value={editingUser.denomination} onChange={(e) => updateEditingField('denomination', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Location</span>
                    <input value={editingUser.location} onChange={(e) => updateEditingField('location', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Bio</span>
                    <textarea value={editingUser.bio} onChange={(e) => updateEditingField('bio', e.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <span className="text-sm text-white">Onboarding completed</span>
                    <input type="checkbox" checked={editingUser.onboardingCompleted} onChange={(e) => updateEditingField('onboardingCompleted', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent" />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <span className="text-sm text-white">Account active</span>
                    <input type="checkbox" checked={editingUser.isActive !== false} onChange={(e) => updateEditingField('isActive', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent" />
                  </label>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200">Subscription access</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Subscription status</span>
                      <select
                        value={editingUser.subscriptionStatus}
                        onChange={(e) => updateEditingField('subscriptionStatus', e.target.value as EditableUser['subscriptionStatus'])}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Subscription tier</span>
                      <select
                        value={editingUser.subscriptionTier}
                        onChange={(e) => updateEditingField('subscriptionTier', e.target.value as EditableUser['subscriptionTier'])}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="elite">Pro</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Billing cycle</span>
                      <select
                        value={editingUser.subscriptionBillingCycle}
                        onChange={(e) => updateEditingField('subscriptionBillingCycle', e.target.value as EditableUser['subscriptionBillingCycle'])}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">3-Month</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.98))] px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => void handleSave()}
                      disabled={saving || deletingUser || resettingPassword}
                      className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      onClick={() => void handleResetPassword()}
                      disabled={saving || deletingUser || resettingPassword}
                      className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resettingPassword ? 'Generating...' : 'Reset password'}
                    </button>
                    <button
                      onClick={() => void handleDeleteUser()}
                      disabled={saving || deletingUser || resettingPassword}
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingUser ? 'Deleting...' : 'Delete user'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Password reset generates a Firebase reset link and copies it to your clipboard. Delete permanently removes the auth account and Firestore user record.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPage;

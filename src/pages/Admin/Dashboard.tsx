import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { KPICard } from '@components/KPICard/KPICard';
import { ChartCard } from '@components/ChartCard/ChartCard';
import { Loading } from '@components/Loading/Loading';
import { getMembersSummaryFull, getUnionsSummary, getVisitors } from '@api/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // Fetch members full data
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members-full'],
    queryFn: getMembersSummaryFull,
  });

  // Fetch unions summary
  const { data: unionsSummary } = useQuery({
    queryKey: ['dashboard-unions-summary'],
    queryFn: getUnionsSummary,
  });

  // Fetch visitors
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: visitorsTodayData } = useQuery({
    queryKey: ['visitors-today', today],
    queryFn: () => getVisitors({ from: today, to: today }),
  });

  const { data: visitorsWeekData } = useQuery({
    queryKey: ['visitors-week', weekStart, today],
    queryFn: () => getVisitors({ from: weekStart, to: today }),
  });

  const { data: visitorsMonthData } = useQuery({
    queryKey: ['visitors-month', monthStart, today],
    queryFn: () => getVisitors({ from: monthStart, to: today }),
  });

  // KPI values computed from API summary
  const totalMembers = Number(((membersData?.data as any)?.summary?.grand_total) ?? 0);
  const maleMembers = Number(((membersData?.data as any)?.summary?.by_sex || []).find((s: any) => String(s.sex).toLowerCase().startsWith('m'))?.count ?? 0);
  const femaleMembers = Number(((membersData?.data as any)?.summary?.by_sex || []).find((s: any) => String(s.sex).toLowerCase().startsWith('f'))?.count ?? 0);

  const totalUnions = unionsSummary?.data?.total_unions || 0;

  const sumVisitors = (resp: any) => {
    const rows = resp?.data?.data || [];
    return rows.reduce((sum: number, r: any) => sum + (Number(r.count) || 0), 0);
  };

  const visitorsToday = sumVisitors(visitorsTodayData);
  const visitorsWeek = sumVisitors(visitorsWeekData);
  const visitorsMonth = sumVisitors(visitorsMonthData);

  const kpis = {
    totalMembers,
    maleMembers,
    femaleMembers,
    totalUnions,
    visitorsToday,
    visitorsWeek,
    visitorsMonth,
  };

  // Chart data from API
  const chartData = ((membersData?.data as any)?.by_year || []).map((y: any) => ({
    year: y.year,
    cnt: y.total,
  }));

  const genderData = ((membersData?.data as any)?.summary?.by_sex || []).map((s: any) => ({
    sex: s.sex,
    cnt: s.count,
  }));

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('dashboard.title')}</h1>
        <p className={styles.subtitle}>Welcome to your dashboard overview</p>
      </div>

      {/* KPIs Grid */}
      <div className={styles.kpiGrid}>
        <KPICard
          title={t('dashboard.totalMembers')}
          value={kpis.totalMembers.toLocaleString()}
          change={8.5}
          changeLabel="vs last month"
          variant="primary"
          icon={
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <KPICard
          title={t('dashboard.maleMembers')}
          value={kpis.maleMembers.toLocaleString()}
          change={5.2}
          changeLabel="vs last month"
          variant="success"
          icon={
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M20 9V5h-4M15 10l5-5M13 21a8 8 0 100-16 8 8 0 000 16z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <KPICard
          title={t('dashboard.femaleMembers')}
          value={kpis.femaleMembers.toLocaleString()}
          change={12.3}
          changeLabel="vs last month"
          variant="success"
          icon={
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 16a6 6 0 100-12 6 6 0 000 12zM12 16v6M9 19h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <KPICard
          title={t('dashboard.totalUnions')}
          value={kpis.totalUnions.toString()}
          variant="default"
          icon={
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <KPICard
          title={t('dashboard.visitorsToday')}
          value={kpis.visitorsToday.toString()}
          change={-2.5}
          changeLabel="vs yesterday"
          icon={
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
        />

        <KPICard
          title={t('dashboard.visitorsWeek')}
          value={kpis.visitorsWeek.toLocaleString()}
          icon={
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <ChartCard
          title="Members by Registration Year"
          description="New member registrations over time"
        >
          {isLoading ? (
            <Loading size="md" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Bar dataKey="cnt" name="Members" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Members by Gender"
          description="Gender distribution of members"
        >
          {isLoading ? (
            <Loading size="md" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="sex" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Bar dataKey="cnt" name="Count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <motion.div
        className={styles.quickActions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <a href="/admin/members" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span>Add New Member</span>
          </a>

          <a href="/admin/reports" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span>View Reports</span>
          </a>

          <a href="/admin/unions" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span>Manage Unions</span>
          </a>

          <a href="/admin/executives" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span>Union Executives</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;


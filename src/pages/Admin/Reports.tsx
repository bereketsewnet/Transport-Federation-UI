import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChartCard } from '@components/ChartCard/ChartCard';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import { getMembersSummary, getUnionsCBAExpired, getMembers } from '@api/endpoints';
import { useExportCsv } from '@hooks/useExportCsv';
import { useExportPdf } from '@hooks/useExportPdf';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import styles from './Reports.module.css';

const COLORS = ['#0B63D3', '#E53935', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { exportToCsv } = useExportCsv();
  const { exportToPdf } = useExportPdf();

  // Filters
  const [dateFrom, setDateFrom] = useState('2020-01-01');
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSector, setSelectedSector] = useState('all');

  // Fetch data
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['reports-members-summary'],
    queryFn: getMembersSummary,
  });

  const { data: cbaData, isLoading: loadingCBA } = useQuery({
    queryKey: ['reports-cba-expired'],
    queryFn: getUnionsCBAExpired,
  });

  const { data: allMembersData } = useQuery({
    queryKey: ['all-members-for-export'],
    queryFn: () => getMembers({ per_page: 1000 }),
  });

  // Process data
  const membersByYear = membersData?.data?.per_year || [];
  const membersByGender = membersData?.data?.totals || [];
  const expiredCBAs = cbaData?.data?.data || [];

  // Mock data for additional reports
  const membersByAge = [
    { age_group: 'Under 25', count: 180 },
    { age_group: '25-35', count: 450 },
    { age_group: '36-45', count: 380 },
    { age_group: '46-55', count: 190 },
    { age_group: 'Over 55', count: 50 },
  ];

  const unionsBySector = [
    { sector: 'Transport', count: 8 },
    { sector: 'Communication', count: 7 },
  ];

  const membersBySector = [
    { sector: 'Transport', Male: 480, Female: 290 },
    { sector: 'Communication', Male: 300, Female: 180 },
  ];

  const youthVsElders = [
    { category: 'Youth (<35)', value: 630 },
    { category: 'Elders (≥35)', value: 620 },
  ];

  const cbaStatus = [
    { status: 'Signed', count: 10 },
    { status: 'Pending', count: 3 },
    { status: 'Expired', count: 2 },
  ];

  const handleExportMembersSummary = () => {
    const exportData = allMembersData?.data?.data || [];
    exportToCsv('members-summary', exportData);
  };

  const handleExportMembersPdf = () => {
    const exportData = allMembersData?.data?.data || [];
    exportToPdf('members-report', exportData, undefined, 'Members Summary Report');
  };

  const isLoading = loadingMembers || loadingCBA;

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('reports.title')}</h1>
          <p className={styles.subtitle}>Comprehensive federation reports and analytics</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleExportMembersSummary}>
            {t('reports.exportToCsv')}
          </Button>
          <Button variant="secondary" onClick={handleExportMembersPdf}>
            {t('reports.exportToPdf')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <h3 className={styles.filtersTitle}>Filters</h3>
        <div className={styles.filtersGrid}>
          <FormField
            type="date"
            label={t('reports.from')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <FormField
            type="date"
            label={t('reports.to')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Select
            label="Sector"
            options={[
              { value: 'all', label: 'All Sectors' },
              { value: 'transport', label: 'Transport' },
              { value: 'communication', label: 'Communication' },
            ]}
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          />
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button fullWidth onClick={() => {}}>
              {t('reports.generateReport')}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loading fullScreen message="Loading reports..." />
      ) : (
        <>
          {/* Row 1: Members by Gender and Year */}
          <div className={styles.chartsGrid}>
            <ChartCard
              title={t('reports.membersByGender')}
              description="Total members by gender distribution"
              actions={
                <Button size="sm" variant="ghost">
                  Details
                </Button>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={membersByGender}>
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
                  <Bar dataKey="cnt" name="Count" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title={t('reports.membersByYear')}
              description="New member registrations over time"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={membersByYear}>
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
                  <Line
                    type="monotone"
                    dataKey="cnt"
                    name="Members"
                    stroke={COLORS[0]}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2: Youth vs Elders, CBA Status */}
          <div className={styles.chartsGrid}>
            <ChartCard title={t('reports.youthMembers')} description="Members by age category">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={youthVsElders}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, value, percent }) =>
                      `${category}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {youthVsElders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t('reports.cbaStatus')} description="CBA statuses overview">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cbaStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count, percent }) =>
                      `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {cbaStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 3: Unions by Sector, Members by Age */}
          <div className={styles.chartsGrid}>
            <ChartCard title={t('reports.unionsBySector')} description="Distribution of unions">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={unionsBySector}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="sector" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Unions" fill={COLORS[2]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Members by Age Group" description="Age distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={membersByAge}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="age_group" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Members" fill={COLORS[3]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 4: Members by Sector (Stacked) */}
          <div className={styles.fullWidth}>
            <ChartCard
              title="Members by Sector (Gender Breakdown)"
              description="Gender distribution across sectors"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={membersBySector}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="sector" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Male" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Female" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Expired CBAs Table */}
          {expiredCBAs.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Unions with Expired or Expiring CBAs</h3>
              <div className={styles.table}>
                <table>
                  <thead>
                    <tr>
                      <th>Union ID</th>
                      <th>Union Name</th>
                      <th>End Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredCBAs.map((union, index) => (
                      <tr key={index}>
                        <td>{union.union_id}</td>
                        <td>{union.name_en}</td>
                        <td>{format(new Date(union.next_end_date), 'MMM dd, yyyy')}</td>
                        <td>
                          <span className={styles.statusBadge}>Expired</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className={styles.summarySection}>
            <h3 className={styles.sectionTitle}>Summary Statistics</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>Total Active Members</h4>
                <p className={styles.summaryValue}>1,250</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Youth Members (&lt;35)</h4>
                <p className={styles.summaryValue}>630</p>
                <span className={styles.percentage}>50.4%</span>
              </div>
              <div className={styles.summaryCard}>
                <h4>Active CBAs</h4>
                <p className={styles.summaryValue}>10</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Pending CBAs</h4>
                <p className={styles.summaryValue}>3</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;


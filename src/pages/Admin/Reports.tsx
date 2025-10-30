import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '@components/ChartCard/ChartCard';
import { KPICard } from '@components/KPICard/KPICard';
import { Button } from '@components/Button/Button';
import { Select } from '@components/Select/Select';
import { Loading } from '@components/Loading/Loading';
import {
  getMembersSummaryFull,
  getUnionsSummary,
  getExecutivesRemainingDays,
  getExecutivesExpiringBefore,
  getExecutivesByUnion,
  getMembersUnder35,
  getMembersAbove35,
  getUnionsCBAExpiredList,
  // getUnionsCBAExpiringSoon,
  // getUnionsCBAOngoing,
  getGeneralAssemblyStatus,
  getUnionsNoGeneralAssembly,
  getUnionsAssemblyOnDate,
  getUnionsAssemblyRecent,
  // getTerminatedUnionsCount,
  getTerminatedUnionsList,
  getMembers,
  getUnions,
  getOSHStatistics,
  getOSHIncidents,
  getCBAs,
  getUnionExecutives,
} from '@api/endpoints';
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
  const navigate = useNavigate();

  // Filters
  const [dateFrom] = useState('2020-01-01');
  const [dateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSector] = useState('all');
  const [selectedUnionId, setSelectedUnionId] = useState<number | ''>('');

  // Fetch data
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['reports-members-summary-full'],
    queryFn: getMembersSummaryFull,
  });

  const { data: unionsSummary } = useQuery({
    queryKey: ['reports-unions-summary'],
    queryFn: getUnionsSummary,
  });

  const { data: execRemaining } = useQuery({
    queryKey: ['reports-executives-remaining'],
    queryFn: getExecutivesRemainingDays,
  });

  const { data: execExpiringBefore } = useQuery({
    queryKey: ['reports-executives-expiring-before', dateTo],
    queryFn: () => getExecutivesExpiringBefore(dateTo),
  });

  const { data: unionsList } = useQuery({
    queryKey: ['reports-unions-list'],
    queryFn: () => getUnions({ per_page: 1000 }),
  });

  const firstUnionId = unionsList?.data?.data?.[0]?.union_id as number | undefined;
  const effectiveUnionId = useMemo(() => {
    if (selectedUnionId !== '') return selectedUnionId as number;
    return firstUnionId; // avoid defaulting to 1 to prevent 404s
  }, [selectedUnionId, firstUnionId]);

  const { data: execByUnion } = useQuery({
    queryKey: ['reports-executives-by-union', effectiveUnionId],
    queryFn: () => getExecutivesByUnion(Number(effectiveUnionId)),
    enabled: typeof effectiveUnionId === 'number' && !Number.isNaN(effectiveUnionId) && selectedUnionId !== '',
    retry: false,
  });

  // Fetch all executives for "Overall" view and summary statistics
  const { data: allExecutivesData } = useQuery({
    queryKey: ['reports-executives-overall'],
    queryFn: () => getUnionExecutives({ per_page: 1000 }),
    // Always enabled for summary statistics, also used for "Overall" view
  });

  const { data: youthData } = useQuery({
    queryKey: ['reports-members-under-35'],
    queryFn: getMembersUnder35,
  });

  const { data: eldersData } = useQuery({
    queryKey: ['reports-members-above-35'],
    queryFn: getMembersAbove35,
  });

  // const { data: cbaStatusData } = useQuery({
  //   queryKey: ['reports-cba-status'],
  //   queryFn: getUnionsCBAStatus,
  // });

  const { data: cbaExpiredList, isLoading: loadingCBAExpired } = useQuery({
    queryKey: ['reports-cba-expired-list'],
    queryFn: getUnionsCBAExpiredList,
  });

  // const { data: cbaExpiringSoon } = useQuery({
  //   queryKey: ['reports-cba-expiring-soon', 90],
  //   queryFn: () => getUnionsCBAExpiringSoon(90),
  // });

  // const { data: cbaOngoing } = useQuery({
  //   queryKey: ['reports-cba-ongoing'],
  //   queryFn: getUnionsCBAOngoing,
  // });

  // Fetch all CBAs to get accurate status counts from database
  const { data: allCBAsData } = useQuery({
    queryKey: ['all-cbas-for-status'],
    queryFn: () => getCBAs({ per_page: 1000 }),
  });

  const { data: gaStatus } = useQuery({
    queryKey: ['reports-general-assembly-status'],
    queryFn: getGeneralAssemblyStatus,
  });

  const { data: unionsNoGA } = useQuery({
    queryKey: ['reports-unions-no-ga'],
    queryFn: getUnionsNoGeneralAssembly,
  });

  const { data: unionsGAOnDate } = useQuery({
    queryKey: ['reports-unions-ga-on-date', dateFrom],
    queryFn: () => getUnionsAssemblyOnDate(dateFrom),
  });

  const { data: unionsGARecent } = useQuery({
    queryKey: ['reports-unions-ga-recent', 3],
    queryFn: () => getUnionsAssemblyRecent(3),
  });

  // const { data: terminatedCount } = useQuery({
  //   queryKey: ['reports-terminated-unions-count'],
  //   queryFn: getTerminatedUnionsCount,
  // });

  const { data: terminatedList } = useQuery({
    queryKey: ['reports-terminated-unions-list'],
    queryFn: getTerminatedUnionsList,
  });

  const { data: allMembersData } = useQuery({
    queryKey: ['all-members-for-export'],
    queryFn: () => getMembers({ per_page: 1000 }),
  });

  // Calculate overall executives gender breakdown
  const overallExecutivesByGender = useMemo(() => {
    const executives: any[] = allExecutivesData?.data?.data || [];
    const members: any[] = allMembersData?.data?.data || [];
    const genderCount: Record<string, number> = {};

    // Create a map of mem_id to member sex for quick lookup
    const memberSexMap = new Map<number, string>();
    members.forEach((member: any) => {
      if (member.mem_id || member.id) {
        const memId = member.mem_id || member.id;
        memberSexMap.set(memId, member.sex || '');
      }
    });

    const normalizeSex = (raw: unknown): 'Male' | 'Female' | 'Unknown' => {
      const v = String(raw || '').trim().toLowerCase();
      if (v.startsWith('m')) return 'Male';
      if (v.startsWith('f')) return 'Female';
      return 'Unknown';
    };

    executives.forEach((exec: any) => {
      // Try multiple sources: direct sex field, member object, or lookup from members map
      let sexValue = exec.sex || exec.member?.sex || exec.member_data?.sex || exec.gender || '';
      
      // If still empty, try to get from members map using mem_id
      if (!sexValue && exec.mem_id) {
        sexValue = memberSexMap.get(exec.mem_id) || '';
      }
      
      const sex = normalizeSex(sexValue);
      genderCount[sex] = (genderCount[sex] || 0) + 1;
    });

    return Object.entries(genderCount)
      .map(([sex, count]) => ({ name: sex, value: count }))
      .filter(item => item.value > 0);
  }, [allExecutivesData, allMembersData]);

  // OSH Data Queries
  const { data: oshStatistics } = useQuery({
    queryKey: ['osh-statistics'],
    queryFn: () => getOSHStatistics(),
  });

  const { data: oshIncidents } = useQuery({
    queryKey: ['osh-incidents'],
    queryFn: () => getOSHIncidents({ per_page: 1000 }),
  });

  // Process data (normalize)
  // const membersByYear = useMemo(() => {
  //   const byYear = (membersData?.data as any)?.by_year || (membersData?.data as any)?.per_year || [];
  //   return byYear.map((row: any) => ({ year: row.year, cnt: row.cnt ?? row.total ?? row.count ?? 0 }));
  // }, [membersData]);

  const membersByGender = useMemo(() => {
    const totals = (membersData?.data as any)?.summary?.by_sex || (membersData?.data as any)?.totals || [];
    return totals.map((row: any) => ({ sex: row.sex, cnt: row.cnt ?? row.count ?? 0 }));
  }, [membersData]);

  const unionsBySector = useMemo(() => {
    return unionsSummary?.data?.by_sector || [];
  }, [unionsSummary]);

  // const sectorOptions = useMemo(() => {
  //   const sectors = (unionsSummary?.data?.by_sector || []).map((s: any) => s.sector);
  //   const unique = Array.from(new Set(sectors.filter(Boolean)));
  //   return [{ value: 'all', label: 'All Sectors' }, ...unique.map((s) => ({ value: s, label: s }))];
  // }, [unionsSummary]);

  const expiredCBAs = (cbaExpiredList?.data?.data as any[]) || [];

  const youthVsElders = useMemo(() => {
    const youthTotal = youthData?.data?.total ?? 0;
    const elderTotal = eldersData?.data?.total ?? 0;
    return [
      { category: 'Youth (<35)', value: youthTotal },
      { category: 'Elders (≥35)', value: elderTotal },
    ];
  }, [youthData, eldersData]);

  const cbaStatus = useMemo(() => {
    // Determine CBA status from expiry date: Expired (< today), Pending (<= 90 days), Signed (otherwise)
    const allCBAs: any[] = allCBAsData?.data?.data || [];
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const today = new Date();
    const thresholdDays = 90;

    let signed = 0;
    let expired = 0;
    let pending = 0;

    allCBAs.forEach((cba: any) => {
      const dateStr = cba?.next_end_date || cba?.end_date;
      const endDate = dateStr ? new Date(dateStr) : null;

      if (!endDate || isNaN(endDate.getTime())) {
        // Fallback to DB status field if date is missing/invalid
        const s = String(cba.status || '').toLowerCase();
        if (s === 'expired') expired += 1;
        else if (s === 'pending') pending += 1;
        else signed += 1;
        return;
      }

      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / MS_PER_DAY);
      if (diffDays < 0) expired += 1;
      else if (diffDays <= thresholdDays) pending += 1;
      else signed += 1;
    });

    return [
      { status: 'Signed', count: signed },
      { status: 'Pending', count: pending },
      { status: 'Expired', count: expired },
    ];
  }, [allCBAsData]);

  // Build Members by Sector (Total/Male/Female) using members joined with unions
  const membersBySector = useMemo(() => {
    const members: any[] = allMembersData?.data?.data || [];
    const unions: any[] = unionsList?.data?.data || [];

    const normalizeSector = (s: unknown): string => {
      const v = String(s || '').trim().toLowerCase();
      if (!v) return '';
      if (v.startsWith('trans')) return 'Transport';
      if (v.startsWith('comm')) return 'Communication';
      if (v.startsWith('logis')) return 'Logistics';
      if (v.startsWith('avia')) return 'Aviation';
      if (v.startsWith('mari') || v.startsWith('marit')) return 'Maritime';
      return v.charAt(0).toUpperCase() + v.slice(1);
    };

    const unionIdToSector = new Map<number, string>();
    unions.forEach((u) => unionIdToSector.set(u.union_id, normalizeSector(u.sector)));

    const defaultSectors = ['Transport', 'Communication', 'Logistics', 'Aviation', 'Maritime'];
    const sectorAgg: Record<string, { Total: number; Male: number; Female: number }> = {};
    defaultSectors.forEach((s) => (sectorAgg[s] = { Total: 0, Male: 0, Female: 0 }));

    members.forEach((m) => {
      const sector = normalizeSector(unionIdToSector.get(m.union_id));
      if (!sector) return; // skip if union not found
      if (!sectorAgg[sector]) sectorAgg[sector] = { Total: 0, Male: 0, Female: 0 };
      const isFemale = String(m.sex).toLowerCase().startsWith('f');
      sectorAgg[sector].Total += 1;
      if (isFemale) sectorAgg[sector].Female += 1; else sectorAgg[sector].Male += 1;
    });

    // Return in preferred order first, then any extras
    const ordered = defaultSectors
      .map((s) => ({ sector: s, ...sectorAgg[s] }))
      .filter((r) => r.Total > 0 || r.Male > 0 || r.Female > 0);

    const extras = Object.entries(sectorAgg)
      .filter(([k]) => !defaultSectors.includes(k))
      .map(([sector, vals]) => ({ sector, ...vals }))
      .sort((a, b) => a.sector.localeCompare(b.sector));

    return [...ordered, ...extras];
  }, [allMembersData, unionsList]);

  // KPI values
  const totalMembers = Number(((membersData?.data as any)?.summary?.grand_total) ?? 0);
  const maleCount = Number(((membersData?.data as any)?.summary?.by_sex || []).find((s: any) => String(s.sex).toLowerCase().startsWith('m'))?.count ?? 0);
  const femaleCount = Number(((membersData?.data as any)?.summary?.by_sex || []).find((s: any) => String(s.sex).toLowerCase().startsWith('f'))?.count ?? 0);

  // Members by year with Male/Female if available + fallback compute
  const computedByYearFromMembers = useMemo(() => {
    const members: any[] = allMembersData?.data?.data || [];
    const yearAgg: Record<number, { total: number; Male: number; Female: number }> = {};
    members.forEach((m) => {
      const dateStr = String(m.registry_date || m.created_at || '');
      const year = Number(dateStr.slice(0, 4));
      if (!year || Number.isNaN(year)) return;
      if (!yearAgg[year]) yearAgg[year] = { total: 0, Male: 0, Female: 0 };
      yearAgg[year].total += 1;
      const key = String(m.sex).toLowerCase().startsWith('f') ? 'Female' : 'Male';
      yearAgg[year][key as 'Male' | 'Female'] += 1;
    });
    return Object.entries(yearAgg)
      .map(([year, vals]) => ({ year: Number(year), ...vals }))
      .sort((a, b) => a.year - b.year);
  }, [allMembersData]);

  const membersByYearFull = useMemo(() => {
    const apiByYear: any[] = (membersData?.data as any)?.by_year || (membersData?.data as any)?.per_year || [];
    if (!apiByYear.length) return computedByYearFromMembers;
    const map: Record<number, { total: number; Male?: number; Female?: number }> = {};
    apiByYear.forEach((row: any) => {
      const year = row.year;
      map[year] = {
        total: row.total ?? row.cnt ?? row.count ?? 0,
        Male: row.Male ?? row.male,
        Female: row.Female ?? row.female,
      };
    });
    computedByYearFromMembers.forEach((c) => {
      if (!map[c.year]) map[c.year] = { total: c.total };
      if (map[c.year].Male === undefined) map[c.year].Male = c.Male;
      if (map[c.year].Female === undefined) map[c.year].Female = c.Female;
      if (!map[c.year].total) map[c.year].total = c.total;
    });
    return Object.entries(map)
      .map(([year, v]) => ({ year: Number(year), total: v.total, Male: v.Male ?? 0, Female: v.Female ?? 0 }))
      .sort((a, b) => a.year - b.year);
  }, [membersData, computedByYearFromMembers]);

  // Apply filters
  const filteredMembersByYear = useMemo(() => {
    const fromY = parseInt(String(dateFrom).slice(0, 4), 10);
    const toY = parseInt(String(dateTo).slice(0, 4), 10);
    return membersByYearFull.filter((d) => (isNaN(fromY) || d.year >= fromY) && (isNaN(toY) || d.year <= toY));
  }, [membersByYearFull, dateFrom, dateTo]);

  const filteredUnionsBySector = useMemo(() => {
    if (selectedSector === 'all') return unionsBySector;
    return unionsBySector.filter((u: any) => u.sector === selectedSector);
  }, [unionsBySector, selectedSector]);

  const filteredMembersBySector = useMemo(() => {
    if (selectedSector === 'all') return membersBySector;
    return membersBySector.filter((m) => m.sector === selectedSector);
  }, [membersBySector, selectedSector]);

  const filteredExpiredCBAs = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return expiredCBAs.filter((u: any) => {
      const d = new Date(u.next_end_date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [expiredCBAs, dateFrom, dateTo]);

  // OSH Data Processing
  const oshIncidentsByCategory = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    const categoryCount: Record<string, number> = {};
    
    incidents.forEach((incident) => {
      const category = incident.accidentCategory || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));
  }, [oshIncidents]);

  const oshIncidentsBySeverity = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    const severityCount: Record<string, number> = {};
    
    incidents.forEach((incident) => {
      const severity = incident.injurySeverity || 'Unknown';
      severityCount[severity] = (severityCount[severity] || 0) + 1;
    });
    
    return Object.entries(severityCount).map(([severity, count]) => ({
      severity,
      count,
    }));
  }, [oshIncidents]);

  const oshIncidentsByMonth = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    const monthCount: Record<string, number> = {};
    
    incidents.forEach((incident) => {
      if (!incident.dateTimeOccurred) return;
      const date = new Date(incident.dateTimeOccurred);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
    });
    
    return Object.entries(monthCount)
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [oshIncidents]);

  // Computed OSH Statistics from incidents data
  const computedOSHStatistics = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    
    return {
      totalIncidents: incidents.length,
      fatalIncidents: incidents.filter((incident: any) => incident.injurySeverity === 'Fatal').length,
      majorIncidents: incidents.filter((incident: any) => incident.injurySeverity === 'Major').length,
    };
  }, [oshIncidents]);

  // Mock data for additional reports
  // const membersByAge = [
  //   { age_group: 'Under 25', count: 180 },
  //   { age_group: '25-35', count: 450 },
  //   { age_group: '36-45', count: 380 },
  //   { age_group: '46-55', count: 190 },
  //   { age_group: 'Over 55', count: 50 },
  // ];

  // Calculate Summary Statistics metrics
  const totalExecutives = useMemo(() => {
    const executives = allExecutivesData?.data?.data || [];
    return executives.length;
  }, [allExecutivesData]);

  const unionsWithCBAs = useMemo(() => {
    const cbas = allCBAsData?.data?.data || [];
    const unionIdsWithCBA = new Set<number>();
    cbas.forEach((cba: any) => {
      if (cba.union_id) {
        unionIdsWithCBA.add(cba.union_id);
      }
    });
    return unionIdsWithCBA.size;
  }, [allCBAsData]);

  const unionsWithGeneralAssembly = useMemo(() => {
    const unions = unionsList?.data?.data || [];
    return unions.filter((u: any) => u.general_assembly_date && u.general_assembly_date !== null).length;
  }, [unionsList]);

  const totalOrganizations = useMemo(() => {
    const unions = unionsList?.data?.data || [];
    const organizations = new Set<string>();
    unions.forEach((u: any) => {
      if (u.organization) {
        organizations.add(u.organization.trim());
      }
    });
    return organizations.size;
  }, [unionsList]);

  // NOTE: unionsBySector now comes from API above

  // NOTE: youthVsElders now comes from API above

  // NOTE: cbaStatus now comes from API above


  const isLoading = loadingMembers || loadingCBAExpired;

  const handleCbaSliceClick = (data: any) => {
    if (!data || !data.name) return;
    navigate('/admin/cbas');
  };

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('reports.title')}</h1>
          <p className={styles.subtitle}>Comprehensive federation reports and analytics</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => navigate('/admin/printed-report')}>
            Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards copied from Dashboard style (first 3) */}
      <div className={styles.summaryGrid}>
        <KPICard
          title={t('dashboard.totalMembers')}
          value={totalMembers.toLocaleString()}
          variant="primary"
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <KPICard
          title={t('dashboard.maleMembers')}
          value={maleCount.toLocaleString()}
          variant="success"
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M20 9V5h-4M15 10l5-5M13 21a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <KPICard
          title={t('dashboard.femaleMembers')}
          value={femaleCount.toLocaleString()}
          variant="success"
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 16a6 6 0 100-12 6 6 0 000 12zM12 16v6M9 19h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
      </div>

      {/* Filters removed by request */}

      {isLoading ? (
        <Loading fullScreen message="Loading reports..." />
      ) : (
        <>
          {/* Row 1: Members by Gender and Year */}
          <div className={styles.chartsGrid}>
            <ChartCard
              title={t('reports.membersByGender')}
              description="Total members by gender distribution"
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
                <LineChart data={filteredMembersByYear}>
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
                  <Line type="monotone" dataKey="total" name="Total" stroke={COLORS[0]} strokeWidth={3} />
                  <Line type="monotone" dataKey="Male" name="Male" stroke={COLORS[2]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Female" name="Female" stroke={COLORS[1]} strokeWidth={2} dot={false} />
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
                    {youthVsElders.map((_, index) => (
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
                    onClick={handleCbaSliceClick}
                  >
                    {cbaStatus.map((_, index) => (
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
                <BarChart data={filteredUnionsBySector}>
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

            {/* Hidden: Members by Age Group - Uncomment to show */}
            {/* <ChartCard title="Members by Age Group" description="Age distribution">
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
            </ChartCard> */}
          </div>

          {/* Row 4: Members by Sector (Stacked) */}
          <div className={styles.fullWidth}>
            <ChartCard
              title="Members by Sector (Gender Breakdown)"
              description="Gender distribution across sectors"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredMembersBySector}>
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
                  <Bar dataKey="Total" name="Total" fill={COLORS[5]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Male" name="Male" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Female" name="Female" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Unions by Organization */}
          {unionsSummary?.data?.by_organization && unionsSummary.data.by_organization.length > 0 && (
            <div className={styles.fullWidth}>
              <ChartCard title="Unions by Organization" description="Distribution across organizations">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={unionsSummary.data.by_organization}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="organization" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Unions" fill={COLORS[4]} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* Executives Remaining Days */}
          {execRemaining?.data?.data && execRemaining.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Executives Remaining Term</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Term Ends</th>
                        <th>Days Left</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {execRemaining.data.data.map((e, idx) => (
                        <tr key={idx}>
                          <td>{e.union_name}</td>
                          <td>{e.executive_name}</td>
                          <td>{e.position}</td>
                          <td>{format(new Date(e.term_end_date), 'MMM dd, yyyy')}</td>
                          <td>{e.days_remaining}</td>
                          <td>{e.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Executives Expiring Before Date */}
          {execExpiringBefore?.data?.data && execExpiringBefore.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Executives Expiring Before {dateTo}</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Term Ends</th>
                        <th>Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {execExpiringBefore.data.data.map((e, idx) => (
                        <tr key={idx}>
                          <td>{e.union_name}</td>
                          <td>{e.executive_name}</td>
                          <td>{e.position}</td>
                          <td>{format(new Date(e.term_end_date), 'MMM dd, yyyy')}</td>
                          <td>{e.days_remaining}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Executives by Gender and General Assembly Status - Side by Side */}
          {(((selectedUnionId === '' && overallExecutivesByGender.length > 0) || (selectedUnionId !== '' && execByUnion?.data?.executives_count)) || gaStatus?.data) && (
            <div className={styles.chartsGrid}>
              {/* Executives Count By Union */}
              {((selectedUnionId === '' && overallExecutivesByGender.length > 0) || (selectedUnionId !== '' && execByUnion?.data?.executives_count)) && (
              <ChartCard
                title="Executives by Gender (Selected Union)"
                  description={selectedUnionId === '' ? 'Overall - All Unions' : execByUnion?.data?.union_name || ''}
                actions={
                  unionsList?.data?.data ? (
                    <Select
                      label="Union"
                      options={[
                          { value: '', label: 'Overall' },
                          ...unionsList.data.data.map((u: any) => ({ value: String(u.union_id), label: u.name_en }))
                        ]}
                        value={selectedUnionId === '' ? '' : String(selectedUnionId)}
                        onChange={(e) => {
                          const v = String(e.target.value || '');
                          setSelectedUnionId(v === '' ? '' : Number(v));
                        }}
                    />
                  ) : undefined
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                        data={selectedUnionId === '' 
                          ? overallExecutivesByGender 
                          : execByUnion?.data?.executives_count?.by_sex?.map((s: any) => ({ name: s.sex, value: s.count })) || []
                        }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                        {(selectedUnionId === '' ? overallExecutivesByGender : execByUnion?.data?.executives_count?.by_sex?.map((s: any) => ({ name: s.sex, value: s.count })) || []).map((_: any, index: number) => (
                        <Cell key={`sex-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
          )}

          {/* General Assembly Status */}
          {gaStatus?.data && (
              <ChartCard title="General Assembly Status" description="Conducted vs Not Conducted">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Conducted', value: gaStatus.data.conducted_general_assembly },
                        { name: 'Not Conducted', value: gaStatus.data.not_conducted },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
              )}
            </div>
          )}

          {/* Unions without GA */}
          {unionsNoGA?.data?.data && unionsNoGA.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Unions Without General Assembly</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union ID</th>
                        <th>Name</th>
                        <th>Sector</th>
                        <th>Organization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unionsNoGA.data.data.map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td>{u.union_id || u.id}</td>
                          <td>{u.name_en}</td>
                          <td>{u.sector}</td>
                          <td>{u.organization}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Unions assembly on date */}
          {unionsGAOnDate?.data?.data && unionsGAOnDate.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Unions Assembly on {dateFrom}</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union</th>
                        <th>Assembly Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unionsGAOnDate.data.data.map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td>{u.name_en}</td>
                          <td>{u.general_assembly_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Recent General Assembly (< 3 months) */}
          {(() => {
            // Calculate from general_assembly_date to today, show only past 3 months (0-90 days ago)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
            
            // Get all data from API - API should already filter by 3 months
            const allData = unionsGARecent?.data?.data || [];
            
            // Debug: Log raw data to see what we're getting
            if (allData.length > 0) {
              console.log('🔍 Raw GA Recent Data:', allData);
            }
            
            // Map and calculate days correctly (always calculate from date to ensure correct sign)
            // Positive = past, Negative = future
            const recentGAData = allData.map((u: any) => {
              let daysSince: number | null = null;
              
              // Always calculate from general_assembly_date (ignore API's days_since_assembly as it may be wrong)
              if (u.general_assembly_date) {
                try {
                  const assemblyDate = new Date(u.general_assembly_date);
                  if (!isNaN(assemblyDate.getTime())) {
                    assemblyDate.setHours(0, 0, 0, 0);
                    // Calculate: today - assembly_date
                    // Positive = past (assembly happened X days ago)
                    // Negative = future (assembly is in X days)
                    const diffTime = today.getTime() - assemblyDate.getTime();
                    daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  }
                } catch (e) {
                  // Invalid date, skip
                  return null;
                }
              }
              
              if (daysSince === null) {
                return null;
              }
              
              return {
                ...u,
                days_since_assembly: daysSince
              };
            }).filter((u: any): u is any => {
              if (!u) return false;
              const daysSince = Number(u.days_since_assembly);
              // Only show past assemblies within 3 months (0-90 days ago)
              const isValid = !isNaN(daysSince) && daysSince >= 0 && daysSince <= 90;
              if (!isValid && daysSince !== undefined) {
                console.log('🚫 Filtered out:', u.union_name || u.name_en, 'days_since:', daysSince);
              }
              return isValid;
            });
            
            // Debug: Log filtered results
            console.log('✅ Filtered GA Recent Data:', recentGAData.length, 'out of', allData.length);
            
            // Show table if we have data, or show message if API returned data but it was filtered out
            if (recentGAData.length > 0) {
              return (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Recent General Assembly (&lt; 3 months)</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union</th>
                        <th>Date</th>
                        <th>Days Since</th>
                      </tr>
                    </thead>
                    <tbody>
                          {recentGAData.map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td>{u.union_name || u.name_en}</td>
                          <td>{u.general_assembly_date}</td>
                          <td>{u.days_since_assembly}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
              );
            }
            
            // If API returned data but was filtered out, or API returned no data
            // (Don't show anything if no data - this is expected behavior)
            return null;
          })()}

          {/* Terminated Unions List */}
          {terminatedList?.data?.data && terminatedList.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Terminated Unions</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Sector</th>
                        <th>Terminated Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {terminatedList.data.data.map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td>{u.id}</td>
                          <td>{u.name_en}</td>
                          <td>{u.sector}</td>
                          <td>{u.terminated_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Expired CBAs Table */}
          {filteredExpiredCBAs.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Unions with Expired or Expiring CBAs</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
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
                      {filteredExpiredCBAs.map((union, index) => (
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
            </div>
          )}

          {/* OSH Reports Section */}
          {oshStatistics?.data && (
            <>
              <div className={styles.sectionTitle}>
                <h2>Occupational Safety and Health (OSH) Reports</h2>
              </div>
              
              {/* OSH KPI Cards */}
              <div className={styles.summaryGrid}>
                <KPICard
                  title="Total Incidents"
                  value={computedOSHStatistics.totalIncidents.toLocaleString()}
                  variant="primary"
                  icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                />
                <KPICard
                  title="Fatal Incidents"
                  value={computedOSHStatistics.fatalIncidents.toLocaleString()}
                  variant="danger"
                  icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                />
                <KPICard
                  title="Major Incidents"
                  value={computedOSHStatistics.majorIncidents.toLocaleString()}
                  variant="warning"
                  icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                />
              </div>

              {/* OSH Charts */}
              <div className={styles.chartsGrid}>
                <ChartCard
                  title="Incidents by Category"
                  description="Distribution of incidents by accident category"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={oshIncidentsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, count, percent }) =>
                          `${category}: ${count} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {oshIncidentsByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Incidents by Severity"
                  description="Distribution of incidents by injury severity"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={oshIncidentsBySeverity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="severity" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Count" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* OSH Monthly Trends */}
              {oshIncidentsByMonth.length > 0 && (
                <div className={styles.fullWidth}>
                  <ChartCard
                    title="Monthly Incident Trends"
                    description="Incident trends over time"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={oshIncidentsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip
                          contentStyle={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Incidents" stroke={COLORS[2]} strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              )}

              {/* OSH Incidents Table */}
              {oshIncidents?.data?.data && oshIncidents.data.data.length > 0 && (
                <div className={styles.tableSection}>
                  <h3 className={styles.sectionTitle}>Recent OSH Incidents</h3>
                  <div className={styles.table}>
                    <div className={styles.tableWrapper}>
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Union</th>
                            <th>Category</th>
                            <th>Severity</th>
                            <th>Location</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {oshIncidents.data.data.slice(0, 10).map((incident: any, idx: number) => (
                            <tr key={idx}>
                              <td>
                                {incident.dateTimeOccurred && !isNaN(new Date(incident.dateTimeOccurred).getTime()) 
                                  ? format(new Date(incident.dateTimeOccurred), 'MMM dd, yyyy')
                                  : 'N/A'
                                }
                              </td>
                              <td>{incident.union?.name_en || (incident.unionId ? `Union ID: ${incident.unionId}` : 'N/A')}</td>
                              <td>{incident.accidentCategory || 'Not Set'}</td>
                              <td>
                                <span className={`${styles.statusBadge} ${
                                  incident.injurySeverity === 'Fatal' ? styles.danger :
                                  incident.injurySeverity === 'Major' ? styles.warning :
                                  incident.injurySeverity === 'Minor' ? styles.success : styles.info
                                }`}>
                                  {incident.injurySeverity}
                                </span>
                              </td>
                              <td>{incident.locationSite}</td>
                              <td>
                                <span className={`${styles.statusBadge} ${
                                  incident.status === 'Closed' ? styles.success :
                                  incident.status === 'Under Investigation' ? styles.warning : styles.info
                                }`}>
                                  {incident.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Summary Statistics */}
          <div className={styles.summarySection}>
            <h3 className={styles.sectionTitle}>Summary Statistics</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>Total Executive Members</h4>
                <p className={styles.summaryValue}>{totalExecutives.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Unions with CBAs</h4>
                <p className={styles.summaryValue}>{unionsWithCBAs.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Unions with General Assembly</h4>
                <p className={styles.summaryValue}>{unionsWithGeneralAssembly.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Total Organizations</h4>
                <p className={styles.summaryValue}>{totalOrganizations.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;


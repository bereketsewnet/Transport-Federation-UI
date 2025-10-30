import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/Button/Button';
import { Loading } from '@components/Loading/Loading';
import {
  getMembersSummaryFull,
  getUnionsSummary,
  getExecutivesRemainingDays,
  getExecutivesExpiringBefore,
  getMembersUnder35,
  getMembersAbove35,
  getUnionsCBAExpiredList,
  getUnionsCBAExpiringSoon,
  getUnionsCBAOngoing,
  getGeneralAssemblyStatus,
  getUnionsNoGeneralAssembly,
  getUnionsAssemblyRecent,
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
import { FaPrint, FaArrowLeft } from 'react-icons/fa';
import styles from './PrintedReportPage.module.css';

const COLORS = ['#0B63D3', '#E53935', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const PrintedReportPage: React.FC = () => {
  const navigate = useNavigate();
  const dateFrom = '2020-01-01';
  const dateTo = format(new Date(), 'yyyy-MM-dd');
  
  // State for filters
  const [executiveExpiryDate, setExecutiveExpiryDate] = useState<string>(dateTo);
  const [selectedUnionId, setSelectedUnionId] = useState<string>('');
  const [cbaExpiringDays, setCbaExpiringDays] = useState<number>(90); // Default 3 months

  // Fetch all data
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
    queryKey: ['reports-executives-expiring-before', executiveExpiryDate],
    queryFn: () => getExecutivesExpiringBefore(executiveExpiryDate),
    enabled: !!executiveExpiryDate,
  });

  const { data: unionsList } = useQuery({
    queryKey: ['reports-unions-list'],
    queryFn: () => getUnions({ per_page: 1000 }),
  });

  const { data: allExecutivesData } = useQuery({
    queryKey: ['reports-executives-overall'],
    queryFn: () => getUnionExecutives({ per_page: 1000 }),
  });

  const { data: youthData } = useQuery({
    queryKey: ['reports-members-under-35'],
    queryFn: getMembersUnder35,
  });

  const { data: eldersData } = useQuery({
    queryKey: ['reports-members-above-35'],
    queryFn: getMembersAbove35,
  });

  const { data: cbaExpiredList } = useQuery({
    queryKey: ['reports-cba-expired-list'],
    queryFn: getUnionsCBAExpiredList,
  });

  const { data: cbaExpiringSoon } = useQuery({
    queryKey: ['reports-cba-expiring-soon', cbaExpiringDays],
    queryFn: () => getUnionsCBAExpiringSoon(cbaExpiringDays),
  });

  const { data: cbaOngoing } = useQuery({
    queryKey: ['reports-cba-ongoing'],
    queryFn: getUnionsCBAOngoing,
  });

  const { data: execByUnion } = useQuery({
    queryKey: ['reports-executives-by-union', selectedUnionId],
    queryFn: () => getUnionExecutives({ union_id: Number(selectedUnionId), per_page: 1000 }),
    enabled: !!selectedUnionId && selectedUnionId !== '',
  });

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


  const { data: unionsGARecent } = useQuery({
    queryKey: ['reports-unions-ga-recent', 3],
    queryFn: () => getUnionsAssemblyRecent(3),
  });

  const { data: terminatedList } = useQuery({
    queryKey: ['reports-terminated-unions-list'],
    queryFn: getTerminatedUnionsList,
  });

  const { data: allMembersData } = useQuery({
    queryKey: ['all-members-for-export'],
    queryFn: () => getMembers({ per_page: 1000 }),
  });

  const { data: oshStatistics } = useQuery({
    queryKey: ['osh-statistics'],
    queryFn: () => getOSHStatistics(),
  });

  const { data: oshIncidents } = useQuery({
    queryKey: ['osh-incidents'],
    queryFn: () => getOSHIncidents({ per_page: 1000 }),
  });

  // Process data
  const membersByGender = useMemo(() => {
    const totals = (membersData?.data as any)?.summary?.by_sex || [];
    return totals.map((row: any) => ({ sex: row.sex, cnt: row.cnt ?? row.count ?? 0 }));
  }, [membersData]);

  const unionsBySector = useMemo(() => {
    return unionsSummary?.data?.by_sector || [];
  }, [unionsSummary]);

  const totalMembers = Number(((membersData?.data as any)?.summary?.grand_total) ?? 0);

  const membersByYearFull = useMemo(() => {
    const apiByYear: any[] = (membersData?.data as any)?.by_year || [];
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

    apiByYear.forEach((row: any) => {
      const year = row.year;
      if (!yearAgg[year]) yearAgg[year] = { total: 0, Male: 0, Female: 0 };
      yearAgg[year].total = row.total ?? row.cnt ?? row.count ?? yearAgg[year].total;
      if (row.Male !== undefined) yearAgg[year].Male = row.Male;
      if (row.Female !== undefined) yearAgg[year].Female = row.Female;
    });

    return Object.entries(yearAgg)
      .map(([year, v]) => ({ year: Number(year), total: v.total, Male: v.Male ?? 0, Female: v.Female ?? 0 }))
      .sort((a, b) => a.year - b.year);
  }, [membersData, allMembersData]);

  const youthVsElders = useMemo(() => {
    const youthTotal = youthData?.data?.total ?? 0;
    const elderTotal = eldersData?.data?.total ?? 0;
    return [
      { category: 'Youth (<35)', value: youthTotal },
      { category: 'Elders (≥35)', value: elderTotal },
    ];
  }, [youthData, eldersData]);

  // Youth under 35 by gender (separate charts)
  const youthByGender = useMemo(() => {
    const members: any[] = allMembersData?.data?.data || [];
    const today = new Date();
    const genderCount = { Male: 0, Female: 0 };
    
    members.forEach((m: any) => {
      const birthdate = m.birthdate ? new Date(m.birthdate) : null;
      if (!birthdate) return;
      
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age -= 1;
      }
      
      if (age < 35) {
        const sex = String(m.sex || '').toLowerCase();
        if (sex.startsWith('m')) genderCount.Male += 1;
        else if (sex.startsWith('f')) genderCount.Female += 1;
      }
    });
    
    return [
      { name: 'Male', value: genderCount.Male },
      { name: 'Female', value: genderCount.Female },
    ].filter(item => item.value > 0);
  }, [allMembersData]);

  // Elders above 35 by gender (separate charts)
  const eldersByGender = useMemo(() => {
    const members: any[] = allMembersData?.data?.data || [];
    const today = new Date();
    const genderCount = { Male: 0, Female: 0 };
    
    members.forEach((m: any) => {
      const birthdate = m.birthdate ? new Date(m.birthdate) : null;
      if (!birthdate) return;
      
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age -= 1;
      }
      
      if (age >= 35) {
        const sex = String(m.sex || '').toLowerCase();
        if (sex.startsWith('m')) genderCount.Male += 1;
        else if (sex.startsWith('f')) genderCount.Female += 1;
      }
    });
    
    return [
      { name: 'Male', value: genderCount.Male },
      { name: 'Female', value: genderCount.Female },
    ].filter(item => item.value > 0);
  }, [allMembersData]);

  // Executives by selected union
  const executivesBySelectedUnion = useMemo(() => {
    if (!selectedUnionId || !execByUnion?.data?.data) return [];
    
    const executives: any[] = execByUnion.data.data;
    const members: any[] = allMembersData?.data?.data || [];
    const genderCount: Record<string, number> = {};
    
    const memberSexMap = new Map<number, string>();
    members.forEach((member: any) => {
      if (member.mem_id || member.id) {
        memberSexMap.set(member.mem_id || member.id, member.sex || '');
      }
    });
    
    const normalizeSex = (raw: unknown): string => {
      const v = String(raw || '').trim().toLowerCase();
      if (v.startsWith('m')) return 'Male';
      if (v.startsWith('f')) return 'Female';
      return 'Unknown';
    };
    
    executives.forEach((exec: any) => {
      let sexValue = exec.sex || exec.member?.sex || exec.member_data?.sex || '';
      if (!sexValue && exec.mem_id) {
        sexValue = memberSexMap.get(exec.mem_id) || '';
      }
      const sex = normalizeSex(sexValue);
      genderCount[sex] = (genderCount[sex] || 0) + 1;
    });
    
    return Object.entries(genderCount)
      .map(([sex, count]) => ({ name: sex, value: count }))
      .filter(item => item.value > 0);
  }, [execByUnion, allMembersData, selectedUnionId]);

  // Strategic plan counts
  const strategicPlanStats = useMemo(() => {
    const unions: any[] = unionsList?.data?.data || [];
    let withPlan = 0;
    let withoutPlan = 0;
    
    unions.forEach((u: any) => {
      if (u.strategic_plan_in_place === true) {
        withPlan += 1;
      } else {
        withoutPlan += 1;
      }
    });
    
    return { withPlan, withoutPlan, total: unions.length };
  }, [unionsList]);

  const cbaStatus = useMemo(() => {
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

  const membersBySector = useMemo(() => {
    const members: any[] = allMembersData?.data?.data || [];
    const unions: any[] = unionsList?.data?.data || [];

    const unionIdToSector = new Map<number, string>();
    unions.forEach((u) => unionIdToSector.set(u.union_id, String(u.sector || '').trim()));

    const sectorAgg: Record<string, { Total: number; Male: number; Female: number }> = {};

    members.forEach((m) => {
      const sector = unionIdToSector.get(m.union_id) || 'Unknown';
      if (!sectorAgg[sector]) sectorAgg[sector] = { Total: 0, Male: 0, Female: 0 };
      const isFemale = String(m.sex).toLowerCase().startsWith('f');
      sectorAgg[sector].Total += 1;
      if (isFemale) sectorAgg[sector].Female += 1; else sectorAgg[sector].Male += 1;
    });

    return Object.entries(sectorAgg)
      .map(([sector, vals]) => ({ sector, ...vals }))
      .sort((a, b) => a.sector.localeCompare(b.sector));
  }, [allMembersData, unionsList]);

  const overallExecutivesByGender = useMemo(() => {
    const executives: any[] = allExecutivesData?.data?.data || [];
    const members: any[] = allMembersData?.data?.data || [];
    const genderCount: Record<string, number> = {};

    const memberSexMap = new Map<number, string>();
    members.forEach((member: any) => {
      if (member.mem_id || member.id) {
        memberSexMap.set(member.mem_id || member.id, member.sex || '');
      }
    });

    const normalizeSex = (raw: unknown): 'Male' | 'Female' | 'Unknown' => {
      const v = String(raw || '').trim().toLowerCase();
      if (v.startsWith('m')) return 'Male';
      if (v.startsWith('f')) return 'Female';
      return 'Unknown';
    };

    executives.forEach((exec: any) => {
      let sexValue = exec.sex || exec.member?.sex || exec.member_data?.sex || exec.gender || '';
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

  const totalExecutives = useMemo(() => {
    return (allExecutivesData?.data?.data || []).length;
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

  const totalUnions = useMemo(() => {
    return (unionsList?.data?.data || []).length;
  }, [unionsList]);

  const expiredCBAs = (cbaExpiredList?.data?.data as any[]) || [];

  const recentGAData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allData = unionsGARecent?.data?.data || [];

    return allData.map((u: any) => {
      let daysSince: number | null = null;
      if (u.general_assembly_date) {
        try {
          const assemblyDate = new Date(u.general_assembly_date);
          if (!isNaN(assemblyDate.getTime())) {
            assemblyDate.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - assemblyDate.getTime();
            daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          }
        } catch (e) {
          return null;
        }
      }
      return { ...u, days_since_assembly: daysSince };
    }).filter((u: any): u is any => {
      if (!u || u.days_since_assembly === null) return false;
      return u.days_since_assembly >= 0 && u.days_since_assembly <= 90;
    });
  }, [unionsGARecent]);

  const oshIncidentsByCategory = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    const categoryCount: Record<string, number> = {};
    incidents.forEach((incident) => {
      const category = incident.accidentCategory || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([category, count]) => ({ category, count }));
  }, [oshIncidents]);

  const oshIncidentsBySeverity = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    const severityCount: Record<string, number> = {};
    incidents.forEach((incident) => {
      const severity = incident.injurySeverity || 'Unknown';
      severityCount[severity] = (severityCount[severity] || 0) + 1;
    });
    return Object.entries(severityCount).map(([severity, count]) => ({ severity, count }));
  }, [oshIncidents]);

  const computedOSHStatistics = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    return {
      totalIncidents: incidents.length,
      fatalIncidents: incidents.filter((incident: any) => incident.injurySeverity === 'Fatal').length,
      majorIncidents: incidents.filter((incident: any) => incident.injurySeverity === 'Major').length,
    };
  }, [oshIncidents]);

  const handlePrint = () => {
    window.print();
  };

  const isLoading = loadingMembers;

  if (isLoading) {
    return <Loading fullScreen message="Loading report data..." />;
  }

  return (
    <div className={styles.printContainer}>
      {/* Print Button - Hidden when printing */}
      <div className={styles.printControls}>
        <Button variant="secondary" onClick={() => navigate('/admin/reports')}>
          <FaArrowLeft className="mr-2" />
          Back to Reports
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <FaPrint className="mr-2" />
          Print Report
        </Button>
      </div>

      {/* Report Content */}
      <div className={styles.reportContent}>
        {/* Cover Page */}
        <div className={styles.page}>
          <div className={styles.coverPage}>
            <h1 className={styles.mainTitle}>Transport Federation</h1>
            <h2 className={styles.subTitle}>Comprehensive Reports</h2>
            <div className={styles.reportDate}>
              <p><strong>Report Generated:</strong> {format(new Date(), 'MMMM dd, yyyy')}</p>
              <p><strong>Report Period:</strong> {dateFrom} to {dateTo}</p>
            </div>
            <div className={styles.summaryBox}>
              <h3>Executive Summary</h3>
              <div className={styles.summaryStats}>
                <div className={styles.summaryStat}>
                  <span className={styles.statLabel}>Total Members</span>
                  <span className={styles.statValue}>{totalMembers.toLocaleString()}</span>
                </div>
                <div className={styles.summaryStat}>
                  <span className={styles.statLabel}>Total Unions</span>
                  <span className={styles.statValue}>{totalUnions.toLocaleString()}</span>
                </div>
                <div className={styles.summaryStat}>
                  <span className={styles.statLabel}>Total Executives</span>
                  <span className={styles.statValue}>{totalExecutives.toLocaleString()}</span>
                </div>
                <div className={styles.summaryStat}>
                  <span className={styles.statLabel}>Total Organizations</span>
                  <span className={styles.statValue}>{totalOrganizations.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Section 1: Member Statistics */}
        <div className={styles.page}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Member Statistics</h2>
            
            {/* 1.1 Total Members by Gender */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>1.1 Total Members (Male, Female, Total)</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={membersByGender}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sex" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cnt" name="Count" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Gender</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersByGender.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td><strong>{item.sex}</strong></td>
                        <td>{item.cnt.toLocaleString()}</td>
                        <td>{totalMembers > 0 ? ((item.cnt / totalMembers) * 100).toFixed(2) : 0}%</td>
                      </tr>
                    ))}
                    <tr className={styles.totalRow}>
                      <td><strong>Total</strong></td>
                      <td><strong>{totalMembers.toLocaleString()}</strong></td>
                      <td><strong>100%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1.2 Members by Year */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>1.2 Members Registered by Year</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={membersByYearFull}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Total" stroke={COLORS[0]} strokeWidth={2} />
                    <Line type="monotone" dataKey="Male" name="Male" stroke={COLORS[2]} strokeWidth={2} />
                    <Line type="monotone" dataKey="Female" name="Female" stroke={COLORS[1]} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Total</th>
                      <th>Male</th>
                      <th>Female</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersByYearFull.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.year}</strong></td>
                        <td>{item.total.toLocaleString()}</td>
                        <td>{item.Male.toLocaleString()}</td>
                        <td>{item.Female.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1.3 Youth Under 35 by Gender - Separate Charts */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>1.3 Youth Members Under 35 by Gender</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Under 35 Male */}
                <div>
                  <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>Male (&lt;35)</h4>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={youthByGender.filter(item => item.name === 'Male')}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {youthByGender.filter(item => item.name === 'Male').map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[0]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                    Total: {youthByGender.find(item => item.name === 'Male')?.value || 0}
                  </div>
                </div>
                {/* Under 35 Female */}
                <div>
                  <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>Female (&lt;35)</h4>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={youthByGender.filter(item => item.name === 'Female')}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {youthByGender.filter(item => item.name === 'Female').map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[1]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                    Total: {youthByGender.find(item => item.name === 'Female')?.value || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* 1.4 Elders Above 35 by Gender - Separate Charts */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>1.4 Elders Above 35 by Gender</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Above 35 Male */}
                <div>
                  <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>Male (≥35)</h4>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={eldersByGender.filter(item => item.name === 'Male')}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {eldersByGender.filter(item => item.name === 'Male').map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[0]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                    Total: {eldersByGender.find(item => item.name === 'Male')?.value || 0}
                  </div>
                </div>
                {/* Above 35 Female */}
                <div>
                  <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>Female (≥35)</h4>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={eldersByGender.filter(item => item.name === 'Female')}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {eldersByGender.filter(item => item.name === 'Female').map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[1]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                    Total: {eldersByGender.find(item => item.name === 'Female')?.value || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Section 2: Union Statistics */}
        <div className={styles.page}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Union Statistics</h2>
            
            {/* 2.1 Total Unions */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>2.1 Total Number of Unions</h3>
              <div className={styles.kpiBox}>
                <p className={styles.kpiValue}>{totalUnions.toLocaleString()}</p>
              </div>
            </div>

            {/* 2.2 Unions by Sector */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>2.2 Unions by Sector</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={unionsBySector}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Unions" fill={COLORS[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Number of Unions</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unionsBySector.map((item: any, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.sector}</strong></td>
                        <td>{item.count.toLocaleString()}</td>
                        <td>{totalUnions > 0 ? ((item.count / totalUnions) * 100).toFixed(2) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2.3 Unions by Organization */}
            {unionsSummary?.data?.by_organization && unionsSummary.data.by_organization.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>2.3 Unions by Organization</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={unionsSummary.data.by_organization}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="organization" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Unions" fill={COLORS[4]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 2.4 Members by Sector */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>2.4 Members by Sector (Gender Breakdown)</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={membersBySector}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total" name="Total" fill={COLORS[5]} />
                    <Bar dataKey="Male" name="Male" fill={COLORS[0]} />
                    <Bar dataKey="Female" name="Female" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Total</th>
                      <th>Male</th>
                      <th>Female</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersBySector.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.sector}</strong></td>
                        <td>{item.Total.toLocaleString()}</td>
                        <td>{item.Male.toLocaleString()}</td>
                        <td>{item.Female.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2.5 Report 22: Strategic Plan in Place */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>2.5 (Report 22) Unions with Strategic Plan In-Place vs Not In-Place</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'With Strategic Plan', value: strategicPlanStats.withPlan },
                        { name: 'Without Strategic Plan', value: strategicPlanStats.withoutPlan },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS[2]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>With Strategic Plan</strong></td>
                      <td>{strategicPlanStats.withPlan.toLocaleString()}</td>
                      <td>{strategicPlanStats.total > 0 ? ((strategicPlanStats.withPlan / strategicPlanStats.total) * 100).toFixed(2) : 0}%</td>
                    </tr>
                    <tr>
                      <td><strong>Without Strategic Plan</strong></td>
                      <td>{strategicPlanStats.withoutPlan.toLocaleString()}</td>
                      <td>{strategicPlanStats.total > 0 ? ((strategicPlanStats.withoutPlan / strategicPlanStats.total) * 100).toFixed(2) : 0}%</td>
                    </tr>
                    <tr className={styles.totalRow}>
                      <td><strong>Total</strong></td>
                      <td><strong>{strategicPlanStats.total.toLocaleString()}</strong></td>
                      <td><strong>100%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Report Section 3: Executive Statistics */}
        <div className={styles.page}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Executive Statistics</h2>
            
            {/* 3.1 Total Executives */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>3.1 Total Number of Executives</h3>
              <div className={styles.kpiBox}>
                <p className={styles.kpiValue}>{totalExecutives.toLocaleString()}</p>
              </div>
            </div>

            {/* 3.2 Executives by Gender */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>3.2 Executives by Gender (All Unions)</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={overallExecutivesByGender}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overallExecutivesByGender.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Gender</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overallExecutivesByGender.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.value.toLocaleString()}</td>
                        <td>{totalExecutives > 0 ? ((item.value / totalExecutives) * 100).toFixed(2) : 0}%</td>
                      </tr>
                    ))}
                    <tr className={styles.totalRow}>
                      <td><strong>Total</strong></td>
                      <td><strong>{totalExecutives.toLocaleString()}</strong></td>
                      <td><strong>100%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3.3 Executives Remaining Days */}
            {execRemaining?.data?.data && execRemaining.data.data.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>3.3 Executives Remaining Term Days</h3>
                <div className={styles.dataTable}>
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
                      {execRemaining.data.data.slice(0, 20).map((e: any, idx: number) => (
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
                  {execRemaining.data.data.length > 20 && (
                    <p className={styles.tableNote}>*Showing first 20 of {execRemaining.data.data.length} records</p>
                  )}
                </div>
              </div>
            )}

            {/* 3.4 Executives Expiring Before Date (Report 6) */}
            {execExpiringBefore?.data?.data && execExpiringBefore.data.data.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>3.4 (Report 6) Executives Expiring Before {format(new Date(executiveExpiryDate), 'MMM dd, yyyy')}</h3>
                <div className={styles.dataTable}>
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
                      {execExpiringBefore.data.data.map((e: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.union_name}>{e.union_name}</td>
                          <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.executive_name}>{e.executive_name}</td>
                          <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.position}>{e.position}</td>
                          <td>{format(new Date(e.term_end_date), 'MMM dd, yyyy')}</td>
                          <td>{e.days_remaining}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className={styles.tableNote}>Total: {execExpiringBefore.data.data.length} executives</p>
                </div>
              </div>
            )}

            {/* 3.5 Executives by Selected Union (Report 7) */}
            {selectedUnionId && executivesBySelectedUnion.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>3.5 (Report 7) Executive Committee by Selected Union</h3>
                <p style={{ marginBottom: '10px' }}>
                  <strong>Union:</strong> {unionsList?.data?.data?.find((u: any) => String(u.union_id) === selectedUnionId)?.name_en || selectedUnionId}
                </p>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={executivesBySelectedUnion}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {executivesBySelectedUnion.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.dataTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Gender</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {executivesBySelectedUnion.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.value.toLocaleString()}</td>
                          <td>{executivesBySelectedUnion.reduce((sum, e) => sum + e.value, 0) > 0 ? ((item.value / executivesBySelectedUnion.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(2) : 0}%</td>
                        </tr>
                      ))}
                      <tr className={styles.totalRow}>
                        <td><strong>Total</strong></td>
                        <td><strong>{executivesBySelectedUnion.reduce((sum, e) => sum + e.value, 0).toLocaleString()}</strong></td>
                        <td><strong>100%</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Section 4: CBA Statistics */}
        <div className={styles.page}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Collective Bargaining Agreement (CBA) Statistics</h2>
            
            {/* 4.1 Total Unions with CBAs */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>4.1 Total Unions with CBAs</h3>
              <div className={styles.kpiBox}>
                <p className={styles.kpiValue}>{unionsWithCBAs.toLocaleString()}</p>
                <p className={styles.kpiSubtext}>out of {totalUnions.toLocaleString()} total unions</p>
              </div>
            </div>

            {/* 4.2 CBA Status */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>4.2 CBA Status Overview</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={cbaStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count, percent }) =>
                        `${status}: ${count} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {cbaStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cbaStatus.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.status}</strong></td>
                        <td>{item.count.toLocaleString()}</td>
                        <td>{cbaStatus.reduce((sum, i) => sum + i.count, 0) > 0 ? ((item.count / cbaStatus.reduce((sum, i) => sum + i.count, 0)) * 100).toFixed(2) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4.3 Expired CBAs Table */}
            {expiredCBAs.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>4.3 Unions with Expired CBAs</h3>
                <div className={styles.dataTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union ID</th>
                        <th>Union Name</th>
                        <th>Union Code</th>
                        <th>End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiredCBAs.map((union: any, index: number) => (
                        <tr key={index}>
                          <td>{union.union_id}</td>
                          <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={union.name_en}>{union.name_en}</td>
                          <td>{union.union_code || 'N/A'}</td>
                          <td>{union.next_end_date ? format(new Date(union.next_end_date), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td>Expired</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className={styles.tableNote}>Total: {expiredCBAs.length} unions with expired CBAs</p>
                </div>
              </div>
            )}

            {/* 4.4 Report 12: Unions Without CBA */}
            {unionsNoGA && cbaExpiredList && (() => {
              const unionsWithCBA = new Set<number>();
              (allCBAsData?.data?.data || []).forEach((cba: any) => {
                if (cba.union_id) unionsWithCBA.add(cba.union_id);
              });
              const unionsWithoutCBA = (unionsList?.data?.data || []).filter((u: any) => !unionsWithCBA.has(u.union_id));
              return unionsWithoutCBA.length > 0 ? (
                <div className={styles.reportItem}>
                  <h3 className={styles.reportQuestion}>4.4 (Report 12) Unions Without Collective Bargaining Agreement</h3>
                  <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                    <p className={styles.kpiLabel}>Total Count</p>
                    <p className={styles.kpiValue}>{unionsWithoutCBA.length}</p>
                  </div>
                  <div className={styles.dataTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Union ID</th>
                          <th>Union Code</th>
                          <th>Union Name (EN)</th>
                          <th>Union Name (AM)</th>
                          <th>Sector</th>
                          <th>Organization</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unionsWithoutCBA.map((union: any, index: number) => (
                          <tr key={index}>
                            <td>{union.union_id}</td>
                            <td>{union.union_code || 'N/A'}</td>
                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={union.name_en}>{union.name_en || 'N/A'}</td>
                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={union.name_am}>{union.name_am || 'N/A'}</td>
                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={union.sector}>{union.sector || 'N/A'}</td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={union.organization}>{union.organization || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null;
            })()}

            {/* 4.5 Report 14: CBA Expiring Soon */}
            {cbaExpiringSoon?.data?.data && cbaExpiringSoon.data.data.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>4.5 (Report 14) Unions with CBA Expiring Soon (Within {cbaExpiringDays} days)</h3>
                <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>Warning Period:</strong> {cbaExpiringDays === 1 ? '1 day' : cbaExpiringDays === 7 ? '1 week' : cbaExpiringDays === 30 ? '1 month' : cbaExpiringDays === 90 ? '3 months' : cbaExpiringDays === 180 ? '6 months' : cbaExpiringDays === 365 ? '12 months' : cbaExpiringDays === 730 ? '24 months' : `${cbaExpiringDays} days`}
                </p>
                <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                  <p className={styles.kpiLabel}>Total Count</p>
                  <p className={styles.kpiValue}>{cbaExpiringSoon.data.count || cbaExpiringSoon.data.data.length}</p>
                </div>
                <div className={styles.dataTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union ID</th>
                        <th>Union Code</th>
                        <th>Union Name</th>
                        <th>CBA End Date</th>
                        <th>Days Until Expiry</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cbaExpiringSoon.data.data.map((item: any, index: number) => (
                        <tr key={index}>
                          <td>{item.union_id || item.id}</td>
                          <td>{item.union_code || 'N/A'}</td>
                          <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.union_name || item.name_en || 'N/A'}>{item.union_name || item.name_en || 'N/A'}</td>
                          <td>{item.next_end_date || item.end_date ? format(new Date(item.next_end_date || item.end_date), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td>{item.days_until_expiry !== undefined ? item.days_until_expiry : item.days_left !== undefined ? item.days_left : 'N/A'}</td>
                          <td>Pending</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4.6 Report 15: CBA Ongoing */}
            {cbaOngoing?.data?.data && cbaOngoing.data.data.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>4.6 (Report 15) Unions with Ongoing Collective Bargaining Agreement</h3>
                <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                  <p className={styles.kpiLabel}>Total Count</p>
                  <p className={styles.kpiValue}>{cbaOngoing.data.count || cbaOngoing.data.data.length}</p>
                </div>
                <div className={styles.dataTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union ID</th>
                        <th>Union Code</th>
                        <th>Union Name</th>
                        <th>CBA Start Date</th>
                        <th>CBA End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cbaOngoing.data.data.map((item: any, index: number) => (
                        <tr key={index}>
                          <td>{item.union_id || item.id}</td>
                          <td>{item.union_code || 'N/A'}</td>
                          <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.union_name || item.name_en || 'N/A'}>{item.union_name || item.name_en || 'N/A'}</td>
                          <td>{item.start_date || item.begin_date ? format(new Date(item.start_date || item.begin_date), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td>{item.next_end_date || item.end_date ? format(new Date(item.next_end_date || item.end_date), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td>Ongoing</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Section 5: General Assembly Statistics */}
        <div className={styles.page}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>5. General Assembly Statistics</h2>
            
            {/* 5.1 General Assembly Status */}
            {gaStatus?.data && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>5.1 General Assembly Status (Conducted vs Not Conducted)</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Conducted', value: gaStatus.data.conducted_general_assembly },
                          { name: 'Not Conducted', value: gaStatus.data.not_conducted },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
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
                </div>
                <div className={styles.dataTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Conducted</strong></td>
                        <td>{gaStatus.data.conducted_general_assembly.toLocaleString()}</td>
                        <td>{totalUnions > 0 ? ((gaStatus.data.conducted_general_assembly / totalUnions) * 100).toFixed(2) : 0}%</td>
                      </tr>
                      <tr>
                        <td><strong>Not Conducted</strong></td>
                        <td>{gaStatus.data.not_conducted.toLocaleString()}</td>
                        <td>{totalUnions > 0 ? ((gaStatus.data.not_conducted / totalUnions) * 100).toFixed(2) : 0}%</td>
                      </tr>
                      <tr className={styles.totalRow}>
                        <td><strong>Total</strong></td>
                        <td><strong>{totalUnions.toLocaleString()}</strong></td>
                        <td><strong>100%</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5.2 Unions with General Assembly */}
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>5.2 Total Unions with General Assembly</h3>
              <div className={styles.kpiBox}>
                <p className={styles.kpiValue}>{unionsWithGeneralAssembly.toLocaleString()}</p>
                <p className={styles.kpiSubtext}>out of {totalUnions.toLocaleString()} total unions</p>
              </div>
            </div>

            {/* 5.3 Unions Without General Assembly */}
            {unionsNoGA?.data?.data && unionsNoGA.data.data.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>5.3 Unions Without General Assembly</h3>
                <div className={styles.dataTable}>
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
                      {unionsNoGA.data.data.slice(0, 20).map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td>{u.union_id || u.id}</td>
                          <td>{u.name_en}</td>
                          <td>{u.sector}</td>
                          <td>{u.organization}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {unionsNoGA.data.data.length > 20 && (
                    <p className={styles.tableNote}>*Showing first 20 of {unionsNoGA.data.data.length} records</p>
                  )}
                </div>
              </div>
            )}

            {/* 5.4 Recent General Assembly */}
            {recentGAData.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>5.4 Recent General Assembly (Last 3 Months)</h3>
                <div className={styles.dataTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union</th>
                        <th>Date</th>
                        <th>Days Since</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentGAData.slice(0, 20).map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td>{u.union_name || u.name_en}</td>
                          <td>{u.general_assembly_date}</td>
                          <td>{u.days_since_assembly}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recentGAData.length > 20 && (
                    <p className={styles.tableNote}>*Showing first 20 of {recentGAData.length} records</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Section 6: Terminated Unions (Report 19) */}
        {terminatedList?.data?.data && terminatedList.data.data.length > 0 && (
          <div className={styles.page}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>6. Terminated Unions (Report 19)</h2>
              
              {/* Report 19: Total Terminated Unions Count */}
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>6.0 (Report 19) Total Terminated Unions</h3>
                <div className={styles.kpiBox}>
                  <p className={styles.kpiLabel}>Total Terminated Unions</p>
                  <p className={styles.kpiValue}>{terminatedList.data.data.length.toLocaleString()}</p>
                </div>
              </div>

              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>6.1 Terminated Unions List</h3>
                <div className={styles.dataTable}>
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
          </div>
        )}

        {/* Report Section 7: OSH Reports */}
        {oshStatistics?.data && (
          <div className={styles.page}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>7. Occupational Safety and Health (OSH) Reports</h2>
              
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>7.1 OSH Statistics</h3>
                <div className={styles.kpiGrid}>
                  <div className={styles.kpiBox}>
                    <p className={styles.kpiLabel}>Total Incidents</p>
                    <p className={styles.kpiValue}>{computedOSHStatistics.totalIncidents.toLocaleString()}</p>
                  </div>
                  <div className={styles.kpiBox}>
                    <p className={styles.kpiLabel}>Fatal Incidents</p>
                    <p className={styles.kpiValue}>{computedOSHStatistics.fatalIncidents.toLocaleString()}</p>
                  </div>
                  <div className={styles.kpiBox}>
                    <p className={styles.kpiLabel}>Major Incidents</p>
                    <p className={styles.kpiValue}>{computedOSHStatistics.majorIncidents.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {oshIncidentsByCategory.length > 0 && (
                <div className={styles.reportItem}>
                  <h3 className={styles.reportQuestion}>7.2 Incidents by Category</h3>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={oshIncidentsByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, count, percent }) =>
                            `${category}: ${count} (${(percent * 100).toFixed(1)}%)`
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
                  </div>
                </div>
              )}

              {oshIncidentsBySeverity.length > 0 && (
                <div className={styles.reportItem}>
                  <h3 className={styles.reportQuestion}>7.3 Incidents by Severity</h3>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={oshIncidentsBySeverity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="severity" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Count" fill={COLORS[1]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Statistics Page */}
        <div className={styles.page}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Summary Statistics</h2>
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
              <div className={styles.summaryCard}>
                <h4>Total Members</h4>
                <p className={styles.summaryValue}>{totalMembers.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Total Unions</h4>
                <p className={styles.summaryValue}>{totalUnions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.pageFooter}>
          <p>Report Generated by Transport Federation Management System</p>
          <p>Date: {format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintedReportPage;


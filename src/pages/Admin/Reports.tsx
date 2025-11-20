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
  getOrganizationLeadersSummary,
  getOrganizationLeadersReportList,
  getOrganizations,
  OrganizationLeadersReportRow,
  getDisciplineByCase,
  getDisciplineJudiciaryVerdicts,
  getDisciplinesList,
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

  const { data: organizationLeadersSummary } = useQuery({
    queryKey: ['reports-organization-leaders-summary'],
    queryFn: getOrganizationLeadersSummary,
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

  const { data: organizationLeadersList } = useQuery({
    queryKey: ['reports-organization-leaders-list'],
    queryFn: () => getOrganizationLeadersReportList({ per_page: 10 }),
  });

  const { data: organizationsList } = useQuery({
    queryKey: ['reports-organizations-list'],
    queryFn: () => getOrganizations({ per_page: 1000 }),
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

  const activeMembers = useMemo(() => {
    const allMembers = allMembersData?.data?.data || [];
    if (!allMembers.length) {
      return allMembers;
    }
    return allMembers.filter((member: any) => {
      if (member.is_active === undefined || member.is_active === null) {
        return true;
      }
      return Boolean(member.is_active);
    });
  }, [allMembersData]);

  // Calculate overall executives gender breakdown
  const overallExecutivesByGender = useMemo(() => {
    const executives: any[] = allExecutivesData?.data?.data || [];
    const members: any[] = allMembersData?.data?.data || [];
    const genderCount: Record<string, number> = {};

    // Create multiple lookup maps for better matching
    const memberSexByMemId = new Map<number, string>();
    const memberSexByMemberCode = new Map<string, string>();
    const memberSexById = new Map<number, string>();
    
    members.forEach((member: any) => {
      const sex = member.sex || '';
      if (member.mem_id) {
        memberSexByMemId.set(member.mem_id, sex);
      }
      if (member.member_code) {
        memberSexByMemberCode.set(String(member.member_code).toLowerCase().trim(), sex);
      }
      if (member.id) {
        memberSexById.set(member.id, sex);
      }
    });

    const normalizeSex = (raw: unknown): 'Male' | 'Female' | 'Unknown' => {
      const v = String(raw || '').trim().toLowerCase();
      // Handle various formats: 'm', 'male', 'male ', 'M', 'Male', etc.
      if (v.startsWith('m') && v.length <= 5) return 'Male';
      // Handle various formats: 'f', 'female', 'female ', 'F', 'Female', etc.
      if (v.startsWith('f') && v.length <= 6) return 'Female';
      return 'Unknown';
    };

    executives.forEach((exec: any) => {
      // Try multiple sources: direct sex field, member object, or lookup from members map
      let sexValue = exec.sex || 
                    exec.member?.sex || 
                    exec.member_data?.sex || 
                    exec.gender || 
                    exec.member_sex || '';
      
      // If still empty, try to get from members map using multiple identifiers
      if (!sexValue) {
        // Try mem_id first
        if (exec.mem_id) {
          sexValue = memberSexByMemId.get(exec.mem_id) || '';
        }
        // Try member_code
        if (!sexValue && exec.member_code) {
          sexValue = memberSexByMemberCode.get(String(exec.member_code).toLowerCase().trim()) || '';
        }
        // Try member.member_code
        if (!sexValue && exec.member?.member_code) {
          sexValue = memberSexByMemberCode.get(String(exec.member.member_code).toLowerCase().trim()) || '';
        }
        // Try id
        if (!sexValue && exec.member_id) {
          sexValue = memberSexById.get(exec.member_id) || '';
        }
        // Try member.id
        if (!sexValue && exec.member?.id) {
          sexValue = memberSexById.get(exec.member.id) || '';
        }
      }
      
      const sex = normalizeSex(sexValue);
      genderCount[sex] = (genderCount[sex] || 0) + 1;
    });

    // Return only Male and Female, exclude Unknown if we have valid data
    const result = Object.entries(genderCount)
      .map(([sex, count]) => ({ name: sex, value: count }))
      .filter(item => item.value > 0);
    
    // If we have Unknown but also have Male/Female, prioritize showing Male/Female
    // Only show Unknown if it's the only category
    const hasValidData = result.some(item => item.name === 'Male' || item.name === 'Female');
    if (hasValidData) {
      return result.filter(item => item.name !== 'Unknown');
    }
    
    return result;
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

  // Discipline Data Queries
  const { data: disciplineByCase } = useQuery({
    queryKey: ['discipline-by-case', selectedUnionId, dateFrom, dateTo],
    queryFn: () => getDisciplineByCase({
      union_id: selectedUnionId !== '' ? selectedUnionId as number : undefined,
      from_date: dateFrom,
      to_date: dateTo,
    }),
  });

  const { data: disciplineJudiciaryVerdicts } = useQuery({
    queryKey: ['discipline-judiciary-verdicts', selectedUnionId, dateFrom, dateTo],
    queryFn: () => getDisciplineJudiciaryVerdicts({
      union_id: selectedUnionId !== '' ? selectedUnionId as number : undefined,
      from_date: dateFrom,
      to_date: dateTo,
    }),
  });

  const { data: disciplinesList } = useQuery({
    queryKey: ['disciplines-list', selectedUnionId],
    queryFn: () => getDisciplinesList({
      union_id: selectedUnionId !== '' ? selectedUnionId as number : undefined,
      per_page: 20,
    }),
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

  const organizationLeadersTotal = organizationLeadersSummary?.data?.total_leaders ?? 0;

  const organizationLeadersPreview = useMemo<OrganizationLeadersReportRow[]>(() => {
    return (organizationLeadersList?.data?.data ?? []) as OrganizationLeadersReportRow[];
  }, [organizationLeadersList]);

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
    // Normalize using DB status first, then derive from dates
    const allCBAs: any[] = allCBAsData?.data?.data || [];
    const today = new Date();
    let signed = 0;
    let notSigned = 0;
    let ongoing = 0;

    const normalizeFromDb = (raw: unknown): 'Signed' | 'Ongoing' | 'Not-Signed' | null => {
      const v = String(raw || '').toLowerCase();
      if (!v) return null;
      if (v === 'signed') return 'Signed';
      if (v === 'ongoing' || v === 'active') return 'Ongoing';
      if (v === 'not-signed' || v === 'notsigned' || v === 'not_signed' || v === 'expired') return 'Not-Signed';
      if (v === 'pending') return 'Signed'; // treat as pre-start signed
      return null;
    };

    allCBAs.forEach((cba: any) => {
      const dbNorm = normalizeFromDb(cba?.status);
      if (dbNorm) {
        if (dbNorm === 'Signed') signed += 1;
        else if (dbNorm === 'Ongoing') ongoing += 1;
        else notSigned += 1;
        return;
      }

      const startStr = cba?.registration_date || cba?.start_date;
      const endStr = cba?.next_end_date || cba?.end_date;
      const start = startStr ? new Date(startStr) : null;
      const end = endStr ? new Date(endStr) : null;
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        notSigned += 1;
        return;
      }
      if (start > today) signed += 1;
      else if (start <= today && end >= today) ongoing += 1;
      else notSigned += 1;
    });

    return [
      { status: 'Signed', count: signed },
      { status: 'Ongoing', count: ongoing },
      { status: 'Not-Signed', count: notSigned },
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
  const totalMembers = activeMembers.length;
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
      fatalityIncidents: incidents.filter((incident: any) => incident.injurySeverity === 'Fatality').length,
      permanentDisabilityIncidents: incidents.filter((incident: any) => incident.injurySeverity === 'Permanent Disability/Major Injury').length,
    };
  }, [oshIncidents]);

  // Active Judiciary Cases - filter by judiciary_intermediate === true
  const activeJudiciaryCases = useMemo(() => {
    const disciplines: any[] = disciplinesList?.data?.data || [];
    return disciplines.filter((discipline: any) => {
      return discipline.judiciary_intermediate === true;
    });
  }, [disciplinesList]);

  // Discipline Data Processing
  const disciplineByCaseData = useMemo(() => {
    const data = disciplineByCase?.data;
    if (!data?.summary?.by_case) return [];
    return data.summary.by_case.map((item: any) => ({
      name: item.case,
      value: item.count,
      percentage: parseFloat(item.percentage),
    }));
  }, [disciplineByCase]);

  const disciplineVerdictsData = useMemo(() => {
    const data = disciplineJudiciaryVerdicts?.data;
    if (!data?.summary?.by_verdict) return [];
    return data.summary.by_verdict.map((item: any) => ({
      name: item.verdict_for,
      value: item.count,
      percentage: parseFloat(item.percentage),
    }));
  }, [disciplineJudiciaryVerdicts]);

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
    const organizations = organizationsList?.data?.data || [];
    return organizations.length;
  }, [organizationsList]);

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
          <h1 className={styles.title}>Union Operations Suite (UOS)</h1>
          <p className={styles.subtitle}>Reports</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => navigate('/admin/printed-report')}>
            {t('reports.printReport')}
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
        <KPICard
          title={t('reports.organizationLeaders')}
          value={organizationLeadersTotal.toLocaleString()}
          variant="info"
          icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6m0-6a3 3 0 010 6m0-6c-1.657 0-3-1.79-3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
      </div>

      {/* Filters removed by request */}

      {isLoading ? (
        <Loading fullScreen message={t('reports.loadingReports')} />
      ) : (
        <>
          {/* Row 1: Members by Gender and Year */}
          <div className={styles.chartsGrid}>
            <ChartCard
              title={t('reports.membersByGender')}
              description={t('reports.totalMembersByGender')}
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
                  <Bar dataKey="cnt" name={t('reports.count')} fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title={t('reports.membersByYear')}
              description={t('reports.newMemberRegistrations')}
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
                  <Line type="monotone" dataKey="total" name={t('reports.total')} stroke={COLORS[0]} strokeWidth={3} />
                  <Line type="monotone" dataKey="Male" name={t('reports.male')} stroke={COLORS[2]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Female" name={t('reports.female')} stroke={COLORS[1]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2: Youth vs Elders, CBA Status */}
          <div className={styles.chartsGrid}>
            <ChartCard title={t('reports.youthMembers')} description={t('reports.membersByAgeCategory')}>
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

            <ChartCard title={t('reports.cbaStatus')} description={t('reports.cbaStatusesOverview')}>
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
            <ChartCard title={t('reports.unionsBySector')} description={t('reports.distributionOfUnions')}>
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
                  <Bar dataKey="Total" name={t('reports.total')} fill={COLORS[5]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Male" name={t('reports.male')} fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Female" name={t('reports.female')} fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {organizationLeadersPreview.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Organization Leaders Snapshot</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>Leader</th>
                        <th>Position</th>
                        <th>Union</th>
                        <th>Sector</th>
                        <th>Organization</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizationLeadersPreview.slice(0, 10).map((leader, idx) => (
                        <tr key={`${leader.id}-${idx}`}>
                          <td>
                            {[leader.title, leader.first_name, leader.father_name, leader.surname]
                              .filter(Boolean)
                              .join(' ') || 'N/A'}
                          </td>
                          <td>{leader.position || 'N/A'}</td>
                          <td>{leader.union_name || leader.union?.name_en || `Union ${leader.union_id}`}</td>
                          <td>{leader.sector || leader.union?.sector || 'N/A'}</td>
                          <td>{leader.organization || leader.union?.organization || 'N/A'}</td>
                          <td>{leader.phone || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {organizationLeadersTotal > 10 && (
                    <p className={styles.tableNote}>
                      {t('reports.showingLeaders', { count: 10, total: organizationLeadersTotal.toLocaleString() })}
                    </p>
                  )}
                </div>
              </div>
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
                title={t('reports.executivesByGender')}
                  description={selectedUnionId === '' ? t('reports.overallAllUnions') : execByUnion?.data?.union_name || ''}
                actions={
                  unionsList?.data?.data ? (
                    <Select
                      label={t('reports.union')}
                      options={[
                          { value: '', label: t('reports.overall') },
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
              <ChartCard title={t('reports.generalAssemblyStatus')} description={t('reports.conductedVsNotConducted')}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('reports.conducted'), value: gaStatus.data.conducted_general_assembly },
                        { name: t('reports.notConducted'), value: gaStatus.data.not_conducted },
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
                  title={t('reports.totalIncidents')}
                  value={computedOSHStatistics.totalIncidents.toLocaleString()}
                  variant="primary"
                  icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                />
                <KPICard
                  title={t('reports.fatalityIncidents')}
                  value={computedOSHStatistics.fatalityIncidents.toLocaleString()}
                  variant="danger"
                  icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                />
                <KPICard
                  title={t('reports.permanentDisabilityMajorInjury')}
                  value={computedOSHStatistics.permanentDisabilityIncidents.toLocaleString()}
                  variant="warning"
                  icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                />
              </div>

              {/* OSH Charts */}
              <div className={styles.chartsGrid}>
                <ChartCard
                  title={t('reports.incidentsByCategory')}
                  description={t('reports.distributionByAccidentCategory')}
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
                  title={t('reports.incidentsBySeverity')}
                  description={t('reports.distributionByInjurySeverity')}
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
                      <Bar dataKey="count" name={t('reports.count')} fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* OSH Monthly Trends */}
              {oshIncidentsByMonth.length > 0 && (
                <div className={styles.fullWidth}>
                  <ChartCard
                    title={t('reports.monthlyIncidentTrends')}
                    description={t('reports.incidentTrendsOverTime')}
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
                        <Line type="monotone" dataKey="count" name={t('reports.incidents')} stroke={COLORS[2]} strokeWidth={3} />
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
                                  incident.injurySeverity === 'Fatality' ? styles.danger :
                                  incident.injurySeverity === 'Permanent Disability/Major Injury' ? styles.warning :
                                  incident.injurySeverity === 'None' ? styles.success : styles.info
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

          {/* Discipline Reports Section */}
          <div className={styles.sectionTitle}>
            <h2>{t('reports.disciplineReports')}</h2>
          </div>

          {/* Active Judiciary Cases */}
          <div className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>{t('reports.activeJudiciaryCases')}</h3>
            <div className={styles.summaryGrid}>
              <KPICard
                title={t('reports.activeJudiciaryCases')}
                value={activeJudiciaryCases.length.toLocaleString()}
                variant="warning"
                icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" fill="currentColor"/></svg>}
              />
            </div>
            {activeJudiciaryCases.length > 0 ? (
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>{t('disciplines.union')}</th>
                        <th>{t('disciplines.member')}</th>
                        <th>{t('disciplines.disciplineCase')}</th>
                        <th>{t('disciplines.reason')}</th>
                        <th>{t('disciplines.dateOfAction')}</th>
                        <th>{t('disciplines.resolutionMethod')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeJudiciaryCases.slice(0, 10).map((discipline: any, idx: number) => (
                        <tr key={idx}>
                          <td>{discipline.union?.name_en || `Union ID: ${discipline.union_id}`}</td>
                          <td>{discipline.member ? `${discipline.member.first_name} ${discipline.member.father_name || ''} ${discipline.member.surname || ''}`.trim() : `Member ID: ${discipline.mem_id}`}</td>
                          <td>{discipline.discipline_case}</td>
                          <td>{discipline.reason_of_discipline}</td>
                          <td>{discipline.date_of_action_taken ? format(new Date(discipline.date_of_action_taken), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td>{discipline.resolution_method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No active judiciary cases found.
              </p>
            )}
          </div>

          {/* Discipline Case Taken (Breakdown by Case) */}
          {disciplineByCaseData.length > 0 && (
            <div className={styles.chartsGrid}>
              <ChartCard
                title={t('reports.disciplineCaseTaken')}
                description={t('reports.breakdownByCase')}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={disciplineByCaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percentage }) =>
                        `${name}: ${value} (${percentage.toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {disciplineByCaseData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* Discipline Case Taken Table */}
          {disciplineByCase?.data?.data && disciplineByCase.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>{t('reports.disciplineCaseTaken')}</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>{t('disciplines.union')}</th>
                        <th>{t('disciplines.member')}</th>
                        <th>{t('disciplines.disciplineCase')}</th>
                        <th>{t('disciplines.reason')}</th>
                        <th>{t('disciplines.dateOfAction')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disciplineByCase.data.data.slice(0, 10).map((discipline: any, idx: number) => (
                        <tr key={idx}>
                          <td>{discipline.union?.name_en || `Union ID: ${discipline.union_id}`}</td>
                          <td>{discipline.member ? `${discipline.member.first_name} ${discipline.member.surname || ''}`.trim() : `Member ID: ${discipline.mem_id}`}</td>
                          <td>{discipline.discipline_case}</td>
                          <td>{discipline.reason_of_discipline}</td>
                          <td>{discipline.date_of_action_taken ? format(new Date(discipline.date_of_action_taken), 'MMM dd, yyyy') : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Judiciary Body Verdicts */}
          {disciplineVerdictsData.length > 0 && (
            <div className={styles.chartsGrid}>
              <ChartCard
                title={t('reports.judiciaryBodyVerdicts')}
                description={t('reports.verdictsByParty')}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={disciplineVerdictsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percentage }) =>
                        `${name}: ${value} (${percentage.toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {disciplineVerdictsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* Judiciary Body Verdicts Table */}
          {disciplineJudiciaryVerdicts?.data?.data && disciplineJudiciaryVerdicts.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>{t('reports.judiciaryBodyVerdicts')}</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>{t('disciplines.union')}</th>
                        <th>{t('disciplines.member')}</th>
                        <th>{t('disciplines.disciplineCase')}</th>
                        <th>{t('disciplines.verdictFor')}</th>
                        <th>{t('disciplines.dateOfAction')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disciplineJudiciaryVerdicts.data.data.slice(0, 10).map((discipline: any, idx: number) => (
                        <tr key={idx}>
                          <td>{discipline.union?.name_en || `Union ID: ${discipline.union_id}`}</td>
                          <td>{discipline.member ? `${discipline.member.first_name} ${discipline.member.surname || ''}`.trim() : `Member ID: ${discipline.mem_id}`}</td>
                          <td>{discipline.discipline_case}</td>
                          <td>{discipline.verdict_for || 'N/A'}</td>
                          <td>{discipline.date_of_action_taken ? format(new Date(discipline.date_of_action_taken), 'MMM dd, yyyy') : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Disciplines List (Search & Filter) */}
          {disciplinesList?.data?.data && disciplinesList.data.data.length > 0 && (
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>{t('reports.disciplinesList')}</h3>
              <div className={styles.table}>
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>{t('disciplines.union')}</th>
                        <th>{t('disciplines.member')}</th>
                        <th>{t('disciplines.disciplineCase')}</th>
                        <th>{t('disciplines.reason')}</th>
                        <th>{t('disciplines.dateOfAction')}</th>
                        <th>{t('disciplines.judiciaryIntermediate')}</th>
                        <th>{t('disciplines.resolutionMethod')}</th>
                        <th>{t('disciplines.verdictFor')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disciplinesList.data.data.map((discipline: any, idx: number) => (
                        <tr key={idx}>
                          <td>{discipline.union?.name_en || `Union ID: ${discipline.union_id}`}</td>
                          <td>{discipline.member ? `${discipline.member.first_name} ${discipline.member.surname || ''}`.trim() : `Member ID: ${discipline.mem_id}`}</td>
                          <td>{discipline.discipline_case}</td>
                          <td>{discipline.reason_of_discipline}</td>
                          <td>{discipline.date_of_action_taken ? format(new Date(discipline.date_of_action_taken), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td>{discipline.judiciary_intermediate ? t('common.yes') : t('common.no')}</td>
                          <td>{discipline.resolution_method}</td>
                          <td>{discipline.verdict_for || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className={styles.summarySection}>
            <h3 className={styles.sectionTitle}>{t('reports.summaryStatistics')}</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>{t('reports.totalExecutiveMembers')}</h4>
                <p className={styles.summaryValue}>{totalExecutives.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>{t('reports.unionsWithCBAs')}</h4>
                <p className={styles.summaryValue}>{unionsWithCBAs.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>{t('reports.unionsWithGeneralAssembly')}</h4>
                <p className={styles.summaryValue}>{unionsWithGeneralAssembly.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>{t('reports.totalOrganizations')}</h4>
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


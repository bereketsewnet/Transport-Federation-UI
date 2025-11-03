import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/Button/Button';
import { Loading } from '@components/Loading/Loading';
import { Select } from '@components/Select/Select';
import {
  getMembersSummaryFull,
  getUnionsSummary,
  getExecutivesRemainingDays,
  getMembersUnder35,
  getMembersAbove35,
  getUnionsCBAExpiredList,
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
import { FaArrowLeft, FaSync, FaTimes } from 'react-icons/fa';
import styles from './PrintedReportPage.module.css';

const COLORS = ['#0B63D3', '#E53935', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const PrintedReportPage: React.FC = () => {
  const navigate = useNavigate();
  const dateFrom = '2020-01-01';
  const dateTo = format(new Date(), 'yyyy-MM-dd');
  
  // State for filters
  const [selectedUnionId, setSelectedUnionId] = useState<string>('');
  const [selectedUnionIdForReport31, setSelectedUnionIdForReport31] = useState<string>(''); // For Report 3.1
  const [cbaExpiringDays, setCbaExpiringDays] = useState<number>(90); // Default 3 months
  const [executiveFilterDays, setExecutiveFilterDays] = useState<string>('all'); // 'all', '1', '7', '30', etc.
  const [selectedUnionForAccidents, setSelectedUnionForAccidents] = useState<string>(''); // For Report 24
  const [gaUpcomingDays, setGaUpcomingDays] = useState<number>(90); // For Report 18 - Default 3 months
  const [printPhase, setPrintPhase] = useState<'all' | 'phase2'>('all'); // Print phase selection
  
  // Global date filter for all reports
  const [filterStartDate, setFilterStartDate] = useState<string>(''); // Empty = show all data
  const [filterEndDate, setFilterEndDate] = useState<string>(''); // Empty = show all data

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

  const { data: unionsList } = useQuery({
    queryKey: ['reports-unions-list'],
    queryFn: () => getUnions({ per_page: 1000 }),
  });

  const { data: allExecutivesData } = useQuery({
    queryKey: ['reports-executives-overall'],
    queryFn: () => getUnionExecutives({ per_page: 1000 }),
    enabled: true, // Always fetch
  });

  const { data: allMembersData } = useQuery({
    queryKey: ['all-members-for-export'],
    queryFn: () => getMembers({ per_page: 1000 }),
  });

  // Helper function to get organization from union data
  const getUnionOrganization = useMemo(() => {
    const unions: any[] = unionsList?.data?.data || [];
    const unionMap = new Map<number, string>();
    unions.forEach((u: any) => {
      if (u.union_id) {
        unionMap.set(u.union_id, u.organization || 'N/A');
      }
    });
    return (unionId: number) => unionMap.get(unionId) || 'N/A';
  }, [unionsList]);

  // Filter executives by remaining days - use execRemaining API first, fallback to allExecutivesData
  const filteredExecutives = useMemo(() => {
    // Try API data first
    let allExecutives: any[] = execRemaining?.data?.data || [];
    
    
    // Fallback to allExecutivesData if API returned empty
    if (allExecutives.length === 0 && allExecutivesData?.data?.data) {
      const executivesFromAPI: any[] = allExecutivesData.data.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate remaining days for each executive
      allExecutives = executivesFromAPI.map((exec: any) => {
        const appointedDate = exec.appointed_date ? new Date(exec.appointed_date) : null;
        const termLengthYears = exec.term_length_years || 0;
        
        let daysRemaining = null;
        let termEndDate = null;
        let status = 'Unknown';
        
        if (appointedDate && !isNaN(appointedDate.getTime()) && termLengthYears > 0) {
          termEndDate = new Date(appointedDate);
          termEndDate.setFullYear(termEndDate.getFullYear() + termLengthYears);
          termEndDate.setHours(0, 0, 0, 0);
          
          const diffTime = termEndDate.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (daysRemaining < 0) {
            status = 'Expired';
          } else if (daysRemaining === 0) {
            status = 'Expires Today';
          } else if (daysRemaining <= 30) {
            status = 'Expiring Soon';
          } else {
            status = 'Active';
          }
        }
        
        // Get member name - lookup from allMembersData using mem_id
        let fullName = 'N/A';
        if (exec.mem_id && allMembersData?.data?.data) {
          const members: any[] = allMembersData.data.data;
          const member = members.find((m: any) => (m.mem_id || m.id) === exec.mem_id);
          if (member) {
            const firstName = member.first_name || '';
            const fatherName = member.father_name || '';
            const surname = member.surname || '';
            const nameParts = [firstName, fatherName, surname].filter(part => part && part.trim());
            fullName = nameParts.length > 0 ? nameParts.join(' ') : 'N/A';
          }
        }
        
        // Fallback to exec.member if available
        if (fullName === 'N/A' && exec.member) {
          const firstName = exec.member.first_name || exec.member.name || '';
          const fatherName = exec.member.father_name || '';
          const surname = exec.member.surname || exec.member.last_name || '';
          const nameParts = [firstName, fatherName, surname].filter(part => part && part.trim());
          fullName = nameParts.length > 0 ? nameParts.join(' ') : 'N/A';
        }
        
        // Get union name from unionsList
        const unions: any[] = unionsList?.data?.data || [];
        const union = unions.find((u: any) => u.union_id === exec.union_id);
        const unionName = union?.name_en || union?.name || exec.union?.name_en || exec.union_name || `Union ID: ${exec.union_id}`;
        
        return {
          id: exec.id,
          union_id: exec.union_id,
          union_name: unionName,
          mem_id: exec.mem_id,
          executive_name: fullName,
          sex: exec.sex || exec.member?.sex || exec.member_data?.sex || '',
          position: exec.position || exec.designation || 'N/A',
          appointed_date: exec.appointed_date,
          term_end_date: termEndDate ? termEndDate.toISOString().split('T')[0] : null,
          days_remaining: daysRemaining,
          status: status
        };
      });
      
    }
    
    if (executiveFilterDays === 'all') {
      return allExecutives;
    }
    
    const filterDays = Number(executiveFilterDays);
    if (isNaN(filterDays) || filterDays < 0) {
      return allExecutives;
    }
    
    // Filter executives with days_remaining <= filterDays (executives expiring within the period)
    const filtered = allExecutives.filter((e: any) => {
      const daysRemaining = e.days_remaining;
      // Include executives with days_remaining >= 0 and <= filterDays
      const included = daysRemaining !== undefined && daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= filterDays;
      return included;
    });
    
    
    return filtered;
  }, [execRemaining, executiveFilterDays, allExecutivesData, unionsList, allMembersData]);

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

  // Unused queries - data is calculated client-side from filteredCBAs
  // const { data: cbaExpiringSoon } = useQuery({
  //   queryKey: ['reports-cba-expiring-soon', cbaExpiringDays],
  //   queryFn: () => getUnionsCBAExpiringSoon(cbaExpiringDays),
  // });

  // const { data: cbaOngoing } = useQuery({
  //   queryKey: ['reports-cba-ongoing'],
  //   queryFn: getUnionsCBAOngoing,
  // });

  const { data: execByUnion } = useQuery({
    queryKey: ['reports-executives-by-union', selectedUnionId],
    queryFn: () => getUnionExecutives({ union_id: Number(selectedUnionId), per_page: 1000 }),
    enabled: !!selectedUnionId && selectedUnionId !== '',
  });

  const { data: execByUnionForReport31 } = useQuery({
    queryKey: ['reports-executives-by-union-report31', selectedUnionIdForReport31],
    queryFn: () => getUnionExecutives({ union_id: Number(selectedUnionIdForReport31), per_page: 1000 }),
    enabled: !!selectedUnionIdForReport31 && selectedUnionIdForReport31 !== '',
  });

  const { data: allCBAsData } = useQuery({
    queryKey: ['all-cbas-for-status'],
    queryFn: () => getCBAs({ per_page: 1000 }),
  });

  const { data: gaStatus } = useQuery({
    queryKey: ['reports-general-assembly-status'],
    queryFn: getGeneralAssemblyStatus,
  });

  // Build ongoing CBAs list - ONLY status = "Ongoing"
  const ongoingCBAs = useMemo(() => {
    const all: any[] = allCBAsData?.data?.data || [];
    const unions: any[] = unionsList?.data?.data || [];
    
    // Filter ONLY by status = "Ongoing" (case-insensitive)
    const filtered = all.filter((item: any) => {
      const dbStatus = String(item.status || '').toLowerCase().trim();
      // Only include if status is explicitly "ongoing" or "active" (which maps to Ongoing)
      return dbStatus === 'ongoing' || dbStatus === 'active';
    });
    
    // Map union information
    return filtered.map((cba: any) => {
      const union = unions.find((u: any) => u.union_id === cba.union_id);
      return {
        ...cba,
        union_name: union?.name_en || union?.name || `Union ID: ${cba.union_id}`,
        union_code: union?.union_code || 'N/A',
      };
    });
  }, [allCBAsData, unionsList]);

  // Build expiring CBAs list - Filter by end date within selected period
  const expiringCBAsFiltered = useMemo(() => {
    const all: any[] = allCBAsData?.data?.data || [];
    const unions: any[] = unionsList?.data?.data || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper function to parse date string and avoid timezone issues
    const parseDateString = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      
      // Try parsing different formats
      // Format: YYYY-MM-DD or YYYY/MM/DD
      const dateMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1; // Months are 0-indexed
        const day = parseInt(dateMatch[3], 10);
        return new Date(year, month, day, 0, 0, 0, 0);
      }
      
      // Fallback to standard Date parsing
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return null;
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    };

    // Filter CBAs that expire within the selected period
    const filtered = all.filter((cba: any) => {
      const endStr = cba.next_end_date || cba.end_date;
      if (!endStr) {
        return false;
      }
      
      const endDate = parseDateString(endStr);
      if (!endDate) {
        return false;
      }
      
      // Calculate days until expiry (negative means already expired)
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Include CBAs that expire within the selected period
      // Include both future expiring (0 to cbaExpiringDays) AND recently expired (within last cbaExpiringDays days)
      const isIncluded = Math.abs(diffDays) <= cbaExpiringDays;
      
      return isIncluded;
    });

    // Map union information and calculate days remaining
    const result = filtered.map((cba: any) => {
      const union = unions.find((u: any) => u.union_id === cba.union_id);
      const endStr = cba.next_end_date || cba.end_date;
      const endDate = parseDateString(endStr);
      if (!endDate) {
        return null;
      }
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...cba,
        union_name: union?.name_en || union?.name || `Union ID: ${cba.union_id}`,
        union_code: union?.union_code || 'N/A',
        organization: union?.organization || cba.organization || 'N/A',
        days_remaining: diffDays,
        days_until_expiry: diffDays,
        days_left: diffDays,
      };
    }).filter((item: any) => item !== null);

    return result;
  }, [allCBAsData, unionsList, cbaExpiringDays]);

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

  const { data: oshStatistics } = useQuery({
    queryKey: ['osh-statistics'],
    queryFn: () => getOSHStatistics(),
  });

  const { data: oshIncidents } = useQuery({
    queryKey: ['osh-incidents'],
    queryFn: () => getOSHIncidents({ per_page: 1000 }),
  });

  // Helper function to check if a date falls within the filter range
  const isDateInRange = (dateStr: string | null | undefined): boolean => {
    if (!filterStartDate && !filterEndDate) return true; // No filter = show all
    if (!dateStr) return false; // No date = exclude
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;
      
      date.setHours(0, 0, 0, 0);
      const start = filterStartDate ? new Date(filterStartDate) : null;
      const end = filterEndDate ? new Date(filterEndDate) : null;
      
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999); // Include the entire end date
      
      if (start && end) {
        return date >= start && date <= end;
      } else if (start) {
        return date >= start;
      } else if (end) {
        return date <= end;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  };

  // Filter data by date range - MUST COME BEFORE useMemos that use them
  const filteredMembers = useMemo(() => {
    const members: any[] = allMembersData?.data?.data || [];
    if (!filterStartDate && !filterEndDate) return members;
    
    return members.filter((m: any) => {
      const dateStr = m.registry_date || m.created_at;
      return isDateInRange(dateStr);
    });
  }, [allMembersData, filterStartDate, filterEndDate]);

  const filteredExecutivesByDate = useMemo(() => {
    const executives: any[] = allExecutivesData?.data?.data || [];
    if (!filterStartDate && !filterEndDate) return executives;
    
    return executives.filter((e: any) => {
      const dateStr = e.appointed_date || e.created_at;
      return isDateInRange(dateStr);
    });
  }, [allExecutivesData, filterStartDate, filterEndDate]);

  const filteredCBAs = useMemo(() => {
    const cbas: any[] = allCBAsData?.data?.data || [];
    if (!filterStartDate && !filterEndDate) return cbas;
    
    return cbas.filter((cba: any) => {
      const dateStr = cba.registration_date || cba.start_date || cba.created_at;
      return isDateInRange(dateStr);
    });
  }, [allCBAsData, filterStartDate, filterEndDate]);

  const filteredUnions = useMemo(() => {
    const unions: any[] = unionsList?.data?.data || [];
    if (!filterStartDate && !filterEndDate) return unions;
    
    return unions.filter((u: any) => {
      // Check both established_date and general_assembly_date
      const established = isDateInRange(u.established_date);
      const ga = isDateInRange(u.general_assembly_date);
      return established || ga;
    });
  }, [unionsList, filterStartDate, filterEndDate]);

  const filteredOSHIncidents = useMemo(() => {
    const incidents: any[] = oshIncidents?.data?.data || [];
    if (!filterStartDate && !filterEndDate) return incidents;
    
    return incidents.filter((incident: any) => {
      return isDateInRange(incident.dateTimeOccurred);
    });
  }, [oshIncidents, filterStartDate, filterEndDate]);

  // Process data (using filtered data when date filter is active)
  const membersByGender = useMemo(() => {
    // If filtered, recalculate from filteredMembers, otherwise use API summary
    if (filterStartDate || filterEndDate) {
      const genderCount: Record<string, number> = {};
      filteredMembers.forEach((m: any) => {
        const sex = String(m.sex || '').toLowerCase();
        if (sex.startsWith('m')) genderCount['Male'] = (genderCount['Male'] || 0) + 1;
        else if (sex.startsWith('f')) genderCount['Female'] = (genderCount['Female'] || 0) + 1;
      });
      return Object.entries(genderCount).map(([sex, cnt]) => ({ sex, cnt }));
    }
    
    const totals = (membersData?.data as any)?.summary?.by_sex || [];
    return totals.map((row: any) => ({ sex: row.sex, cnt: row.cnt ?? row.count ?? 0 }));
  }, [membersData, filteredMembers, filterStartDate, filterEndDate]);

  const unionsBySector = useMemo(() => {
    return unionsSummary?.data?.by_sector || [];
  }, [unionsSummary]);

  const totalMembers = useMemo(() => {
    if (filterStartDate || filterEndDate) {
      return filteredMembers.length;
    }
    return Number(((membersData?.data as any)?.summary?.grand_total) ?? 0);
  }, [membersData, filteredMembers, filterStartDate, filterEndDate]);

  const membersByYearFull = useMemo(() => {
    const apiByYear: any[] = (membersData?.data as any)?.by_year || [];
    const members: any[] = (filterStartDate || filterEndDate) ? filteredMembers : (allMembersData?.data?.data || []);
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

    // Only merge API data if no filter is applied
    if (!filterStartDate && !filterEndDate) {
      apiByYear.forEach((row: any) => {
        const year = row.year;
        if (!yearAgg[year]) yearAgg[year] = { total: 0, Male: 0, Female: 0 };
        yearAgg[year].total = row.total ?? row.cnt ?? row.count ?? yearAgg[year].total;
        if (row.Male !== undefined) yearAgg[year].Male = row.Male;
        if (row.Female !== undefined) yearAgg[year].Female = row.Female;
      });
    }

    return Object.entries(yearAgg)
      .map(([year, v]) => ({ year: Number(year), total: v.total, Male: v.Male ?? 0, Female: v.Female ?? 0 }))
      .sort((a, b) => a.year - b.year);
  }, [membersData, allMembersData, filteredMembers, filterStartDate, filterEndDate]);

  // Unused - replaced by youthByGender and eldersByGender
  // const youthVsElders = useMemo(() => {
  //   const youthTotal = youthData?.data?.total ?? 0;
  //   const elderTotal = eldersData?.data?.total ?? 0;
  //   return [
  //     { category: 'Youth (<35)', value: youthTotal },
  //     { category: 'Elders (≥35)', value: elderTotal },
  //   ];
  // }, [youthData, eldersData]);

  // Youth under 35 by gender - Use API data if available, otherwise calculate
  const youthByGender = useMemo(() => {
    // First try to use API data if available (only when no filter)
    const apiData = youthData?.data?.by_sex || [];
    if (apiData.length > 0 && !filterStartDate && !filterEndDate) {
      const result = apiData.map((item: any) => ({
        name: item.sex === 'Male' || item.sex === 'male' || String(item.sex || '').toLowerCase().startsWith('m') ? 'Male' : 'Female',
        value: item.count || item.cnt || 0
      })).filter(item => item.value > 0);
      return result;
    }
    
    // Fallback to calculating from filtered members
    const members: any[] = (filterStartDate || filterEndDate) ? filteredMembers : (allMembersData?.data?.data || []);
    const today = new Date();
    const genderCount = { Male: 0, Female: 0 };
    let totalProcessed = 0;
    let skippedNoBirthdate = 0;
    
    members.forEach((m: any) => {
      const birthdate = m.birthdate ? new Date(m.birthdate) : null;
      if (!birthdate || isNaN(birthdate.getTime())) {
        skippedNoBirthdate += 1;
        return;
      }
      
      totalProcessed += 1;
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
    
    const result = [
      { name: 'Male', value: genderCount.Male },
      { name: 'Female', value: genderCount.Female },
    ].filter(item => item.value > 0);
    
    return result;
  }, [allMembersData, youthData, filteredMembers, filterStartDate, filterEndDate]);

  // Elders above 35 by gender - Use API data if available, otherwise calculate
  const eldersByGender = useMemo(() => {
    // First try to use API data if available (only when no filter)
    const apiData = eldersData?.data?.by_sex || [];
    if (apiData.length > 0 && !filterStartDate && !filterEndDate) {
      const result = apiData.map((item: any) => ({
        name: item.sex === 'Male' || item.sex === 'male' || String(item.sex || '').toLowerCase().startsWith('m') ? 'Male' : 'Female',
        value: item.count || item.cnt || 0
      })).filter(item => item.value > 0);
      return result;
    }
    
    // Fallback to calculating from filtered members
    const members: any[] = (filterStartDate || filterEndDate) ? filteredMembers : (allMembersData?.data?.data || []);
    const today = new Date();
    const genderCount = { Male: 0, Female: 0 };
    let totalProcessed = 0;
    let skippedNoBirthdate = 0;
    
    members.forEach((m: any) => {
      const birthdate = m.birthdate ? new Date(m.birthdate) : null;
      if (!birthdate || isNaN(birthdate.getTime())) {
        skippedNoBirthdate += 1;
        return;
      }
      
      totalProcessed += 1;
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
    
    const result = [
      { name: 'Male', value: genderCount.Male },
      { name: 'Female', value: genderCount.Female },
    ].filter(item => item.value > 0);
    
    return result;
  }, [allMembersData, eldersData, youthByGender, filteredMembers, filterStartDate, filterEndDate]);

  // Calculate overall executives gender breakdown (for "Overall" option)
  const overallExecutivesByGender = useMemo(() => {
    const executives: any[] = (filterStartDate || filterEndDate) ? filteredExecutivesByDate : (allExecutivesData?.data?.data || []);
    const members: any[] = (filterStartDate || filterEndDate) ? filteredMembers : (allMembersData?.data?.data || []);
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
  }, [allExecutivesData, allMembersData, filteredExecutivesByDate, filteredMembers, filterStartDate, filterEndDate]);

  // Executives by selected union (or overall if no union selected) - For Report 7
  const executivesBySelectedUnion = useMemo(() => {
    // If "Overall" is selected (empty string), return overall data
    if (!selectedUnionId || selectedUnionId === '') {
      return overallExecutivesByGender;
    }
    
    // If specific union selected, get data from execByUnion
    if (!execByUnion?.data?.data) return [];
    
    const executives: any[] = execByUnion.data.data;
    const members: any[] = (filterStartDate || filterEndDate) ? filteredMembers : (allMembersData?.data?.data || []);
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
  }, [execByUnion, allMembersData, selectedUnionId, overallExecutivesByGender, filteredMembers, filterStartDate, filterEndDate]);

  // Executives by selected union for Report 3.1 (or overall if no union selected)
  const executivesBySelectedUnionForReport31 = useMemo(() => {
    // If "Overall" is selected (empty string), return overall data
    if (!selectedUnionIdForReport31 || selectedUnionIdForReport31 === '') {
      return overallExecutivesByGender;
    }
    
    // If specific union selected, get data from execByUnionForReport31
    if (!execByUnionForReport31?.data?.data) return [];
    
    const executives: any[] = execByUnionForReport31.data.data;
    const members: any[] = (filterStartDate || filterEndDate) ? filteredMembers : (allMembersData?.data?.data || []);
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
  }, [execByUnionForReport31, allMembersData, selectedUnionIdForReport31, overallExecutivesByGender, filteredMembers, filterStartDate, filterEndDate]);

  // Strategic plan counts
  const strategicPlanStats = useMemo(() => {
    const unions: any[] = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);
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
  }, [unionsList, filteredUnions, filterStartDate, filterEndDate]);

  const cbaStatus = useMemo(() => {
    const allCBAs: any[] = (filterStartDate || filterEndDate) ? filteredCBAs : (allCBAsData?.data?.data || []);
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
      if (v === 'pending') return 'Signed';
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
  }, [allCBAsData, filteredCBAs, filterStartDate, filterEndDate]);

  const membersBySector = useMemo(() => {
    const members: any[] = (filterStartDate || filterEndDate) ? filteredMembers : (allMembersData?.data?.data || []);
    const unions: any[] = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);

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
  }, [allMembersData, unionsList, filteredMembers, filteredUnions, filterStartDate, filterEndDate]);

  const totalExecutives = useMemo(() => {
    const executives = (filterStartDate || filterEndDate) ? filteredExecutivesByDate : (allExecutivesData?.data?.data || []);
    return executives.length;
  }, [allExecutivesData, filteredExecutivesByDate, filterStartDate, filterEndDate]);

  // Total executives count for Report 3.1 (overall or by union)
  const totalExecutivesForReport31 = useMemo(() => {
    if (!selectedUnionIdForReport31 || selectedUnionIdForReport31 === '') {
      return totalExecutives;
    }
    
    if (!execByUnionForReport31?.data?.data) return 0;
    
    return execByUnionForReport31.data.data.length;
  }, [selectedUnionIdForReport31, execByUnionForReport31, totalExecutives]);

  const unionsWithCBAs = useMemo(() => {
    const cbas = (filterStartDate || filterEndDate) ? filteredCBAs : (allCBAsData?.data?.data || []);
    const unionIdsWithCBA = new Set<number>();
    cbas.forEach((cba: any) => {
      if (cba.union_id) {
        unionIdsWithCBA.add(cba.union_id);
      }
    });
    return unionIdsWithCBA.size;
  }, [allCBAsData, filteredCBAs, filterStartDate, filterEndDate]);

  const unionsWithGeneralAssembly = useMemo(() => {
    const unions = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);
    return unions.filter((u: any) => u.general_assembly_date && u.general_assembly_date !== null).length;
  }, [unionsList, filteredUnions, filterStartDate, filterEndDate]);

  const totalOrganizations = useMemo(() => {
    const unions = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);
    const organizations = new Set<string>();
    unions.forEach((u: any) => {
      if (u.organization) {
        organizations.add(u.organization.trim());
      }
    });
    return organizations.size;
  }, [unionsList, filteredUnions, filterStartDate, filterEndDate]);

  const totalUnions = useMemo(() => {
    const unions = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);
    return unions.length;
  }, [unionsList, filteredUnions, filterStartDate, filterEndDate]);

  // Summary statistics for footer (using filtered data when applicable)
  const youthMembersCount = useMemo(() => {
    if (filterStartDate || filterEndDate) {
      return youthByGender.reduce((sum, item) => sum + item.value, 0);
    }
    return youthData?.data?.total || 0;
  }, [youthData, youthByGender, filterStartDate, filterEndDate]);

  const eldersCount = useMemo(() => {
    if (filterStartDate || filterEndDate) {
      return eldersByGender.reduce((sum, item) => sum + item.value, 0);
    }
    return eldersData?.data?.total || 0;
  }, [eldersData, eldersByGender, filterStartDate, filterEndDate]);

  const expiredCBAsCount = useMemo(() => {
    const cbas = (filterStartDate || filterEndDate) ? filteredCBAs : (allCBAsData?.data?.data || []);
    return cbas.filter((cba: any) => {
      const endStr = cba?.next_end_date || cba?.end_date;
      if (!endStr) return false;
      const end = new Date(endStr);
      return !isNaN(end.getTime()) && end < new Date();
    }).length;
  }, [allCBAsData, filteredCBAs, filterStartDate, filterEndDate]);

  const oshIncidentsCount = useMemo(() => {
    const incidents = (filterStartDate || filterEndDate) ? filteredOSHIncidents : (oshIncidents?.data?.data || []);
    return incidents.length;
  }, [oshIncidents, filteredOSHIncidents, filterStartDate, filterEndDate]);

  const unionsWithoutCBACount = useMemo(() => {
    const cbas = (filterStartDate || filterEndDate) ? filteredCBAs : (allCBAsData?.data?.data || []);
    const unions = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);
    
    const unionsWithCBA = new Set<number>();
    cbas.forEach((cba: any) => {
      if (cba.union_id) unionsWithCBA.add(cba.union_id);
    });
    
    return unions.filter((u: any) => !unionsWithCBA.has(u.union_id || u.id)).length;
  }, [allCBAsData, unionsList, filteredCBAs, filteredUnions, filterStartDate, filterEndDate]);

  const unionsWithoutGACount = useMemo(() => {
    const unions = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);
    return unions.filter((u: any) => !u.general_assembly_date || u.general_assembly_date === null).length;
  }, [unionsList, filteredUnions, filterStartDate, filterEndDate]);

  const terminatedUnionsCount = useMemo(() => {
    // Terminated unions list typically doesn't have a date filter, but we can still respect it if the API supports it
    return terminatedList?.data?.data?.length || 0;
  }, [terminatedList]);

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

  // Report 18: Unions with upcoming General Assembly meetings (future dates)
  const upcomingGAData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allUnions: any[] = unionsList?.data?.data || [];

    return allUnions
      .map((u: any) => {
        if (!u.general_assembly_date) return null;
        
        try {
          const assemblyDate = new Date(u.general_assembly_date);
          if (isNaN(assemblyDate.getTime())) return null;
          
          assemblyDate.setHours(0, 0, 0, 0);
          const diffTime = assemblyDate.getTime() - today.getTime();
          const daysUntil = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Only include future dates (positive daysUntil)
          // Filter by selected period (within gaUpcomingDays)
          if (daysUntil > 0 && daysUntil <= gaUpcomingDays) {
            return {
              ...u,
              days_until_assembly: daysUntil,
              union_name: u.name_en || u.name || `Union ${u.union_id || u.id}`,
            };
          }
          
          return null;
        } catch (e) {
          return null;
        }
      })
      .filter((u: any): u is any => u !== null)
      .sort((a: any, b: any) => a.days_until_assembly - b.days_until_assembly); // Sort by days until (ascending)
  }, [unionsList, gaUpcomingDays]);

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

  // Report 23: Monthly Incident Trends (Last 5 Years)
  const oshIncidentsByMonthLast5Years = useMemo(() => {
    const incidents: any[] = (filterStartDate || filterEndDate) ? filteredOSHIncidents : (oshIncidents?.data?.data || []);
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);
    fiveYearsAgo.setHours(0, 0, 0, 0);
    
    const monthCount: Record<string, number> = {};
    
    incidents.forEach((incident) => {
      if (!incident.dateTimeOccurred) return;
      const date = new Date(incident.dateTimeOccurred);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      // Only include incidents from the last 5 years (unless global filter overrides)
      if (!filterStartDate && !filterEndDate) {
        if (date < fiveYearsAgo || date > today) return;
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
    });
    
    return Object.entries(monthCount)
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [oshIncidents, filteredOSHIncidents, filterStartDate, filterEndDate]);

  // Report 24: Filter incidents by union
  const filteredAccidentsByUnion = useMemo(() => {
    const incidents: any[] = (filterStartDate || filterEndDate) ? filteredOSHIncidents : (oshIncidents?.data?.data || []);
    
    if (!selectedUnionForAccidents || selectedUnionForAccidents === '') {
      // Show all accidents if no union selected
      return incidents;
    }
    
    const unionId = Number(selectedUnionForAccidents);
    if (isNaN(unionId)) return incidents;
    
    // Filter by union_id
    return incidents.filter((incident: any) => {
      const incidentUnionId = incident.union_id || incident.unionId || incident.union?.union_id || incident.union?.id;
      return Number(incidentUnionId) === unionId;
    });
  }, [oshIncidents, selectedUnionForAccidents, filteredOSHIncidents, filterStartDate, filterEndDate]);

  const handlePrint = () => {
    // Add data attribute to body to indicate which phase to print
    if (printPhase === 'phase2') {
      document.body.setAttribute('data-print-phase', 'phase2');
    } else {
      document.body.removeAttribute('data-print-phase');
    }
    window.print();
    // Clean up after printing
    setTimeout(() => {
      document.body.removeAttribute('data-print-phase');
    }, 1000);
  };

  const handleRegenerate = () => {
    // Trigger re-render by updating state
    // The useMemo calculations will automatically use the new filterStartDate and filterEndDate
    // Force a refresh by toggling a state or simply the filters will be applied automatically
  };

  const handleResetFilter = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const isLoading = loadingMembers;

  if (isLoading) {
    return <Loading fullScreen message="Loading report data..." />;
  }

  return (
    <div className={styles.printContainer}>
      {/* Print Button - Hidden when printing */}
      <div className={styles.printControls}>
        <Button variant="secondary" onClick={() => navigate('/admin/reports')} title="Back to Reports">
          <FaArrowLeft />
        </Button>
        
        {/* Date Filter Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flexWrap: 'nowrap',
          padding: '8px 10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <label style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', marginRight: '4px' }}>Start Date:</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '13px',
              width: '130px'
            }}
          />
          <label style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '8px', marginRight: '4px' }}>End Date:</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '13px',
              width: '130px'
            }}
          />
          <Button 
            variant="primary" 
            onClick={handleRegenerate}
            style={{ whiteSpace: 'nowrap', padding: '6px 8px', minWidth: 'auto' }}
            title="Regenerate"
          >
            <FaSync />
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleResetFilter}
            style={{ whiteSpace: 'nowrap', padding: '6px 8px', minWidth: 'auto' }}
            title="Reset Filter"
          >
            <FaTimes />
          </Button>
        </div>

        {/* Phase Selection */}
        <Select
          id="print-phase"
          value={printPhase}
          onChange={(e) => setPrintPhase(e.target.value as 'all' | 'phase2')}
          options={[
            { value: 'all', label: 'part 1' },
            { value: 'phase2', label: 'Part 2' },
          ]}
          style={{ width: '140px' }}
        />

        <Button variant="primary" onClick={handlePrint}>
          Print
        </Button>
      </div>

      {/* Report Content */}
      <div className={styles.reportContent}>
        {/* Cover Page - Phase 1 */}
        <div className={styles.page} data-print-phase="phase1">
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

        {/* Report Section 1: Member Statistics - Phase 1 */}
        <div className={styles.page} data-print-phase="phase1">
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

            {/* 1.3 Youth Under 35 by Gender - Combined Chart */}
            {youthByGender && youthByGender.length > 0 && (() => {
              const total = youthByGender.reduce((sum, item) => sum + item.value, 0);
              const dataWithPercent = youthByGender.map(item => ({
                ...item,
                percent: total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00'
              }));
              
              return (
                <div className={styles.reportItem}>
                  <h3 className={styles.reportQuestion}>1.3 Youth Members Under 35 by Gender</h3>
                  <div className={styles.chartContainer} style={{ marginBottom: '20px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dataWithPercent}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, payload }) => `${name}: ${value} (${payload.percent}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dataWithPercent.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string, props: any) => [
                          `${value} (${props.payload.percent}%)`,
                          name
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.dataTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Number</th>
                          <th>Percent (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataWithPercent.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.value.toLocaleString()}</td>
                            <td>{item.percent}%</td>
                          </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                          <td>Total</td>
                          <td>{total.toLocaleString()}</td>
                          <td>100.00%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* 1.4 Elders Above 35 by Gender - Combined Chart */}
            {eldersByGender && eldersByGender.length > 0 && (() => {
              const total = eldersByGender.reduce((sum, item) => sum + item.value, 0);
              const dataWithPercent = eldersByGender.map(item => ({
                ...item,
                percent: total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00'
              }));
              
              return (
                <div className={styles.reportItem}>
                  <h3 className={styles.reportQuestion}>1.4 Elders Above 35 by Gender</h3>
                  <div className={styles.chartContainer} style={{ marginBottom: '20px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dataWithPercent}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, payload }) => `${name}: ${value} (${payload.percent}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dataWithPercent.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string, props: any) => [
                          `${value} (${props.payload.percent}%)`,
                          name
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.dataTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Number</th>
                          <th>Percent (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataWithPercent.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.value.toLocaleString()}</td>
                            <td>{item.percent}%</td>
                          </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                          <td>Total</td>
                          <td>{total.toLocaleString()}</td>
                          <td>100.00%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Report Section 2: Union Statistics - Phase 1 */}
        <div className={styles.page} data-print-phase="phase1">
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

        {/* Report Section 3: Executive Statistics - Phase 1 */}
        <div className={styles.page} data-print-phase="phase1">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Executive Statistics</h2>
            
            {/* 3.1 Total Executives */}
            {(allExecutivesData?.data?.data || execByUnionForReport31?.data?.data) && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>3.1 Total Number of Executives</h3>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label htmlFor="union-select-report31" style={{ fontSize: '14px', fontWeight: 500 }}>Select Union:</label>
                  <div style={{ minWidth: '200px' }}>
                    <Select
                      id="union-select-report31"
                      value={selectedUnionIdForReport31}
                      onChange={(e) => setSelectedUnionIdForReport31(e.target.value)}
                      options={[
                        { value: '', label: 'Overall' },
                        ...(unionsList?.data?.data || []).map((u: any) => ({
                          value: String(u.union_id || u.id),
                          label: u.name_en || u.name || `Union ${u.union_id || u.id}`
                        }))
                      ]}
                    />
                  </div>
                </div>
                <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>
                    {selectedUnionIdForReport31 === '' || !selectedUnionIdForReport31
                      ? 'Overall - All Unions'
                      : unionsList?.data?.data?.find((u: any) => String(u.union_id || u.id) === selectedUnionIdForReport31)?.name_en || `Union ${selectedUnionIdForReport31}`
                    }
                  </strong>
                </p>
                <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                  <p className={styles.kpiLabel}>Total Executives</p>
                  <p className={styles.kpiValue}>{totalExecutivesForReport31.toLocaleString()}</p>
                </div>
                {executivesBySelectedUnionForReport31 && executivesBySelectedUnionForReport31.length > 0 ? (
                  <>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={executivesBySelectedUnionForReport31}
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
                            {executivesBySelectedUnionForReport31.map((_, index) => (
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
                          {executivesBySelectedUnionForReport31.map((item, idx) => (
                            <tr key={idx}>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.value.toLocaleString()}</td>
                              <td>{totalExecutivesForReport31 > 0 ? ((item.value / totalExecutivesForReport31) * 100).toFixed(2) : 0}%</td>
                            </tr>
                          ))}
                          <tr className={styles.totalRow}>
                            <td><strong>Total</strong></td>
                            <td><strong>{totalExecutivesForReport31.toLocaleString()}</strong></td>
                            <td><strong>100%</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    {selectedUnionIdForReport31 === '' || !selectedUnionIdForReport31
                      ? 'No executives found.'
                      : 'No executives found for the selected union.'
                    }
                  </p>
                )}
              </div>
            )}

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


            {/* 3.4 (Report 5 & 6) Executives Remaining Days */}
            {(execRemaining?.data?.data || allExecutivesData?.data?.data) && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>3.4 (Report 5 & 6) List All Executives Who Their Remaining Date is Less Than (Specific Period)</h3>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label htmlFor="executive-filter-period" style={{ fontSize: '14px', fontWeight: 500 }}>Filter by Period:</label>
                  <div style={{ minWidth: '200px' }}>
                    <Select
                      id="executive-filter-period"
                      value={executiveFilterDays}
                      onChange={(e) => setExecutiveFilterDays(e.target.value)}
                      options={[
                        { value: 'all', label: 'All' },
                        { value: '1', label: '1 Day' },
                        { value: '7', label: '1 Week' },
                        { value: '30', label: '1 Month' },
                        { value: '90', label: '3 Months' },
                        { value: '180', label: '6 Months' },
                        { value: '365', label: '1 Year' },
                        { value: '730', label: '2 Years' },
                        { value: '1460', label: '4 Years' },
                        { value: '1825', label: '5 Years' },
                        { value: '3650', label: '10 Years' },
                      ]}
                    />
                  </div>
                </div>
                {filteredExecutives && filteredExecutives.length > 0 ? (
                  <>
                    <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                      <p className={styles.kpiLabel}>Total Count</p>
                      <p className={styles.kpiValue}>{filteredExecutives.length}</p>
                    </div>
                    <div className={styles.dataTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Organization</th>
                            <th>Union Name</th>
                            <th>Executive Name</th>
                            <th>Position</th>
                            <th>Term End Date</th>
                            <th>daysLeft</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExecutives.map((e: any, idx: number) => (
                            <tr key={idx}>
                              <td>{getUnionOrganization(e.union_id)}</td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.union_name || 'N/A'}>{e.union_name || 'N/A'}</td>
                              <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.executive_name || 'N/A'}>{e.executive_name || 'N/A'}</td>
                              <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.position || 'N/A'}>{e.position || 'N/A'}</td>
                              <td>{e.term_end_date ? format(new Date(e.term_end_date), 'MMM dd, yyyy') : 'N/A'}</td>
                              <td>{e.days_remaining !== undefined && e.days_remaining !== null ? e.days_remaining : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No executives found for the selected period.
                  </p>
                )}
              </div>
            )}

            {/* 3.5 Executives by Selected Union (Report 7) */}
            {(allExecutivesData?.data?.data || execByUnion?.data?.data) && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>3.5 (Report 7) Executive Committee by Selected Union</h3>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label htmlFor="union-select-report7" style={{ fontSize: '14px', fontWeight: 500 }}>Select Union:</label>
                  <div style={{ minWidth: '200px' }}>
                    <Select
                      id="union-select-report7"
                      value={selectedUnionId}
                      onChange={(e) => setSelectedUnionId(e.target.value)}
                      options={[
                        { value: '', label: 'Overall' },
                        ...(unionsList?.data?.data || []).map((u: any) => ({
                          value: String(u.union_id || u.id),
                          label: u.name_en || u.name || `Union ${u.union_id || u.id}`
                        }))
                      ]}
                    />
                  </div>
                </div>
                <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>
                    {selectedUnionId === '' || !selectedUnionId
                      ? 'Overall - All Unions'
                      : unionsList?.data?.data?.find((u: any) => String(u.union_id || u.id) === selectedUnionId)?.name_en || `Union ${selectedUnionId}`
                    }
                  </strong>
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
                {executivesBySelectedUnion && executivesBySelectedUnion.length > 0 ? (
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
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    {selectedUnionId === '' || !selectedUnionId
                      ? 'No executives found.'
                      : 'No executives found for the selected union.'
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report Section 4: CBA Statistics - Phase 1 */}
        <div className={styles.page} data-print-phase="phase1">
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
              const cbas = (filterStartDate || filterEndDate) ? filteredCBAs : (allCBAsData?.data?.data || []);
              const unions = (filterStartDate || filterEndDate) ? filteredUnions : (unionsList?.data?.data || []);
              cbas.forEach((cba: any) => {
                if (cba.union_id) unionsWithCBA.add(cba.union_id);
              });
              const unionsWithoutCBA = unions.filter((u: any) => !unionsWithCBA.has(u.union_id));
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
                          <th>Union Code</th>
                          <th>Union Name (EN)</th>
                          <th>Sector</th>
                          <th>Organization</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unionsWithoutCBA.map((union: any, index: number) => (
                          <tr key={index}>
                            <td>{union.union_code || 'N/A'}</td>
                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={union.name_en}>{union.name_en || 'N/A'}</td>
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
            <div className={styles.reportItem}>
              <h3 className={styles.reportQuestion}>4.5 (Report 14) Unions with CBA Expiring Soon</h3>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="cba-expiring-period" style={{ fontSize: '14px', fontWeight: 500 }}>Filter by Period:</label>
                <Select
                  id="cba-expiring-period"
                  value={cbaExpiringDays.toString()}
                  onChange={(e) => setCbaExpiringDays(Number(e.target.value))}
                  options={[
                    { value: '30', label: '1 Month' },
                    { value: '90', label: '3 Months' },
                    { value: '180', label: '6 Months' },
                    { value: '365', label: '1 Year' },
                  ]}
                  style={{ minWidth: '150px' }}
                />
              </div>
              {expiringCBAsFiltered && expiringCBAsFiltered.length > 0 ? (
                <>
                  <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                    <p className={styles.kpiLabel}>Total Count</p>
                    <p className={styles.kpiValue}>{expiringCBAsFiltered.length}</p>
                  </div>
                  <div className={styles.dataTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Organization</th>
                          <th>Union Name</th>
                          <th>Renewal Date</th>
                          <th>End Date</th>
                          <th>Days Until Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringCBAsFiltered.map((item: any, index: number) => (
                          <tr key={index}>
                            <td>{item.organization || 'N/A'}</td>
                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.union_name || item.name_en || 'N/A'}>
                              {item.union_name || item.name_en || 'N/A'}
                            </td>
                            <td>{item.registration_date ? format(new Date(item.registration_date), 'MMM dd, yyyy') : 'N/A'}</td>
                            <td>{item.next_end_date || item.end_date ? format(new Date(item.next_end_date || item.end_date), 'MMM dd, yyyy') : 'N/A'}</td>
                            <td>{item.days_remaining !== undefined ? item.days_remaining : item.days_until_expiry !== undefined ? item.days_until_expiry : item.days_left !== undefined ? item.days_left : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No CBAs expiring within the selected period.</p>
              )}
            </div>

            {/* 4.6 Report 15: CBA Ongoing */}
            {ongoingCBAs && ongoingCBAs.length > 0 && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>4.6 (Report 15) Unions with Ongoing Collective Bargaining Agreement</h3>
                <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                  <p className={styles.kpiLabel}>Total Count</p>
                  <p className={styles.kpiValue}>{ongoingCBAs.length}</p>
                </div>
                <div className={styles.dataTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Union Code</th>
                        <th>Union Name</th>
                        <th>startDate</th>
                        <th>endDate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ongoingCBAs.map((item: any, index: number) => (
                        <tr key={index}>
                          <td>{item.union_code || 'N/A'}</td>
                          <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.union_name || item.name_en || 'N/A'}>{item.union_name || item.name_en || 'N/A'}</td>
                          <td>{(item.registration_date || item.start_date || item.begin_date) ? format(new Date(item.registration_date || item.start_date || item.begin_date), 'MMM dd, yyyy') : 'N/A'}</td>
                          <td>{(item.next_end_date || item.end_date) ? format(new Date(item.next_end_date || item.end_date), 'MMM dd, yyyy') : 'N/A'}</td>
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

        {/* Report Section 5: General Assembly Statistics - Phase 1 */}
        <div className={styles.page} data-print-phase="phase1">
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

            {/* 5.5 Report 18: Upcoming General Assembly Meetings */}
            {unionsList?.data?.data && (
              <div className={styles.reportItem}>
                <h3 className={styles.reportQuestion}>5.5 (Report 18) List Unions Those Last Congress/General Assembly Meeting is Within (Future Dates)</h3>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label htmlFor="ga-upcoming-period" style={{ fontSize: '14px', fontWeight: 500 }}>Filter by Period:</label>
                  <div style={{ minWidth: '200px' }}>
                    <Select
                      id="ga-upcoming-period"
                      value={gaUpcomingDays.toString()}
                      onChange={(e) => setGaUpcomingDays(Number(e.target.value))}
                      options={[
                        { value: '1', label: '1 Day Until' },
                        { value: '7', label: '1 Week Until' },
                        { value: '21', label: '3 Weeks Until' },
                        { value: '30', label: '1 Month Until' },
                        { value: '90', label: '3 Months Until' },
                        { value: '180', label: '6 Months Until' },
                        { value: '365', label: '1 Year Until' },
                        { value: '1095', label: '3 Years Until' },
                        { value: '1825', label: '5 Years Until' },
                        { value: '2190', label: '6 Years Until' },
                      ]}
                    />
                  </div>
                </div>
                {upcomingGAData.length > 0 ? (
                  <>
                    <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                      <p className={styles.kpiLabel}>Total Unions</p>
                      <p className={styles.kpiValue}>{upcomingGAData.length.toLocaleString()}</p>
                    </div>
                    <div className={styles.dataTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Union Code</th>
                            <th>Union Name</th>
                            <th>Sector</th>
                            <th>Organization</th>
                            <th>Assembly Date</th>
                            <th>Days Until</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingGAData.map((u: any, idx: number) => (
                            <tr key={idx}>
                              <td>{u.union_code || 'N/A'}</td>
                              <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.union_name || 'N/A'}>
                                {u.union_name || 'N/A'}
                              </td>
                              <td>{u.sector || 'N/A'}</td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.organization || 'N/A'}>
                                {u.organization || 'N/A'}
                              </td>
                              <td>{u.general_assembly_date ? format(new Date(u.general_assembly_date), 'MMM dd, yyyy') : 'N/A'}</td>
                              <td>{u.days_until_assembly}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No upcoming general assembly meetings found within the selected period.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report Section 6: Terminated Unions (Report 19) - Phase 1 */}
        {terminatedList?.data?.data && terminatedList.data.data.length > 0 && (
          <div className={styles.page} data-print-phase="phase1">
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
                        <th>Name</th>
                        <th>Sector</th>
                        <th>Terminated Date</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {terminatedList.data.data.map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td>{u.name_en}</td>
                          <td>{u.sector}</td>
                          <td>{u.terminated_date}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordWrap: 'break-word' }} title={u.reason || u.termination_reason || 'N/A'}>
                            {u.reason || u.termination_reason || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Section 7: OSH Reports - Phase 2 */}
        {oshStatistics?.data && (
          <div className={styles.page} data-print-phase="phase2">
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

              {/* Report 23: Monthly Incident Trends (Last 5 Years) */}
              {oshIncidentsByMonthLast5Years.length > 0 && (
                <div className={styles.reportItem}>
                  <h3 className={styles.reportQuestion}>7.4 (Report 23) Number of Accidents That Happened in the Last 5 Years</h3>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={oshIncidentsByMonthLast5Years}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Incidents" stroke={COLORS[2]} strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.dataTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {oshIncidentsByMonthLast5Years.map((item, idx) => (
                          <tr key={idx}>
                            <td><strong>{item.month}</strong></td>
                            <td>{item.count.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className={styles.totalRow}>
                          <td><strong>Total</strong></td>
                          <td><strong>{oshIncidentsByMonthLast5Years.reduce((sum, item) => sum + item.count, 0).toLocaleString()}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 24: List Accidents by Union */}
              {oshIncidents?.data?.data && (
                <div className={styles.reportItem}>
                  <h3 className={styles.reportQuestion}>7.5 (Report 24) List Accidents That Happened in the Following Union</h3>
                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label htmlFor="union-select-accidents" style={{ fontSize: '14px', fontWeight: 500 }}>Select Union:</label>
                    <div style={{ minWidth: '200px' }}>
                      <Select
                        id="union-select-accidents"
                        value={selectedUnionForAccidents}
                        onChange={(e) => setSelectedUnionForAccidents(e.target.value)}
                        options={[
                          { value: '', label: 'All Unions' },
                          ...(unionsList?.data?.data || []).map((u: any) => ({
                            value: String(u.union_id || u.id),
                            label: u.name_en || u.name || `Union ${u.union_id || u.id}`
                          }))
                        ]}
                      />
                    </div>
                  </div>
                  {filteredAccidentsByUnion.length > 0 ? (
                    <>
                      <div className={styles.kpiBox} style={{ marginBottom: '20px' }}>
                        <p className={styles.kpiLabel}>Total Accidents</p>
                        <p className={styles.kpiValue}>{filteredAccidentsByUnion.length.toLocaleString()}</p>
                      </div>
                      <div className={styles.dataTable}>
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Union</th>
                              <th>Category</th>
                              <th>Severity</th>
                              <th>Location</th>
                              <th>Status</th>
                              <th>Reported By</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAccidentsByUnion.map((incident: any, idx: number) => (
                              <tr key={idx}>
                                <td>
                                  {incident.dateTimeOccurred && !isNaN(new Date(incident.dateTimeOccurred).getTime())
                                    ? format(new Date(incident.dateTimeOccurred), 'MMM dd, yyyy')
                                    : 'N/A'}
                                </td>
                                <td>
                                  {incident.union?.name_en || 
                                   (incident.union_id ? `Union ID: ${incident.union_id}` : 
                                    (incident.unionId ? `Union ID: ${incident.unionId}` : 'N/A'))}
                                </td>
                                <td>{incident.accidentCategory || 'Not Set'}</td>
                                <td>{incident.injurySeverity || 'Unknown'}</td>
                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={incident.locationSite || ''}>
                                  {incident.locationSite || 'N/A'}
                                </td>
                                <td>{incident.status || 'N/A'}</td>
                                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={incident.reportedBy || ''}>
                                  {incident.reportedBy || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      {selectedUnionForAccidents === '' || !selectedUnionForAccidents
                        ? 'No accidents found.'
                        : 'No accidents found for the selected union.'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Statistics Page - Phase 2 */}
        <div className={styles.page} data-print-phase="phase2">
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Summary Statistics</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>Youth Members (&lt;35)</h4>
                <p className={styles.summaryValue}>{youthMembersCount.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Elders (≥35)</h4>
                <p className={styles.summaryValue}>{eldersCount.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Terminated Unions</h4>
                <p className={styles.summaryValue}>{terminatedUnionsCount.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Expired CBAs</h4>
                <p className={styles.summaryValue}>{expiredCBAsCount.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>OSH Incidents</h4>
                <p className={styles.summaryValue}>{oshIncidentsCount.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Unions Without CBA</h4>
                <p className={styles.summaryValue}>{unionsWithoutCBACount.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Unions Without General Assembly</h4>
                <p className={styles.summaryValue}>{unionsWithoutGACount.toLocaleString()}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Unions with Strategic Plan</h4>
                <p className={styles.summaryValue}>{strategicPlanStats.withPlan.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Phase 2 */}
        <div className={styles.pageFooter} data-print-phase="phase2">
          <p>Report Generated by Transport Federation Management System</p>
          <p>Date: {format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintedReportPage;


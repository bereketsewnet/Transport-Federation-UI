import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  getDisciplines, 
  deleteDiscipline, 
  Discipline,
  DisciplineParams,
  getUnions,
  Union,
  getMembers,
  Member
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { DataTable } from '@components/DataTable/DataTable';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { FormField } from '@components/FormField/FormField';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaGavel,
  FaUser,
  FaEye
} from 'react-icons/fa';
import { formatDate } from '@utils/formatters';
import { DisciplineForm } from './DisciplineForm';
import styles from './Disciplines.module.css';

export const Disciplines: React.FC = () => {
  const { t } = useTranslation();
  const [allDisciplines, setAllDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [unions, setUnions] = useState<Union[]>([]);
  const [filters, setFilters] = useState<DisciplineParams>({
    page: 1,
    per_page: 20
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: DisciplineParams = {
        // Apply filters but fetch all items for client-side member name filtering
        union_id: filters.union_id,
        discipline_case: filters.discipline_case,
        judiciary_intermediate: filters.judiciary_intermediate,
        resolution_method: filters.resolution_method,
        verdict_for: filters.verdict_for,
        from_date: filters.from_date,
        to_date: filters.to_date,
        page: 1,
        per_page: 10000, // Fetch all items to allow client-side filtering by member name
      };
      // Remove q parameter - we'll filter by member name client-side
      delete params.q;
      console.log('Fetching disciplines with params:', params);
      const response = await getDisciplines(params);
      console.log('Disciplines response:', response.data);
      setAllDisciplines(response.data.data || []);
    } catch (err) {
      setError('Failed to load disciplines');
      console.error('Error fetching disciplines:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnions = async () => {
    try {
      const response = await getUnions({ per_page: 1000 });
      setUnions(response.data.data);
    } catch (err) {
      console.error('Error fetching unions:', err);
    }
  };

  useEffect(() => {
    fetchUnions();
  }, []);

  // Fetch when filters change (not when searchQuery changes - that's client-side)
  useEffect(() => {
    fetchDisciplines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Filter disciplines by member name client-side
  const filteredDisciplines = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) {
      return allDisciplines;
    }

    const query = searchQuery.trim().toLowerCase();
    const queryWords = query.split(/\s+/).filter(word => word.length > 0); // Split into words
    
    return allDisciplines.filter((discipline) => {
      if (!discipline.member) {
        return false;
      }
      
      // Build member name with normalized spacing
      const firstName = (discipline.member.first_name || '').trim();
      const fatherName = (discipline.member.father_name || '').trim();
      const surname = (discipline.member.surname || '').trim();
      const memberCode = (discipline.member.member_code || '').trim();
      
      // Combine all name parts and normalize spaces
      const memberName = [firstName, fatherName, surname]
        .filter(part => part.length > 0)
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
      
      // Check member code
      const codeMatch = memberCode.toLowerCase().includes(query);
      
      // Check if all query words are found in the member name (allows partial word matches)
      const nameMatch = queryWords.every(word => memberName.includes(word));
      
      // Also check if the full query is contained in the name (for partial matches like "Test P")
      const fullMatch = memberName.includes(query);
      
      return nameMatch || fullMatch || codeMatch;
    });
  }, [allDisciplines, searchQuery]);

  // Apply pagination to filtered results
  const disciplines = useMemo(() => {
    const page = filters.page || 1;
    const perPage = filters.per_page || 20;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredDisciplines.slice(startIndex, endIndex);
  }, [filteredDisciplines, filters.page, filters.per_page]);

  const handleCreate = () => {
    setEditingDiscipline(null);
    setShowForm(true);
  };

  const handleEdit = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteDiscipline(deletingId, true);
      await fetchDisciplines();
      setShowConfirm(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete discipline');
      console.error('Error deleting discipline:', err);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDiscipline(null);
    fetchDisciplines();
  };

  const getCaseColor = (caseType: string) => {
    switch (caseType) {
      case 'Warning': return styles.caseWarning;
      case 'Salary Penalty': return styles.caseSalaryPenalty;
      case 'Work Suspension': return styles.caseWorkSuspension;
      case 'Termination': return styles.caseTermination;
      default: return styles.caseWarning;
    }
  };

  const columns = [
    {
      key: 'union',
      title: t('disciplines.union'),
      label: t('disciplines.union'),
      width: '200px',
      render: (_value: unknown, discipline: Discipline) => (
        <span className={styles.detailValue}>
          {discipline.union?.name_en || `Union ID: ${discipline.union_id}`}
        </span>
      )
    },
    {
      key: 'member',
      title: t('disciplines.member'),
      label: t('disciplines.member'),
      width: '200px',
      render: (_value: unknown, discipline: Discipline) => (
        <span className={styles.detailValue}>
          <FaUser className="mr-1" />
          {discipline.member 
            ? `${discipline.member.first_name} ${discipline.member.surname || ''}`.trim()
            : `Member ID: ${discipline.mem_id}`}
        </span>
      )
    },
    {
      key: 'discipline_case',
      title: t('disciplines.disciplineCase'),
      label: t('disciplines.disciplineCase'),
      width: '150px',
      render: (_value: unknown, discipline: Discipline) => (
        <span className={`${styles.caseBadge} ${getCaseColor(discipline.discipline_case)}`}>
          {discipline.discipline_case}
        </span>
      )
    },
    {
      key: 'reason_of_discipline',
      title: t('disciplines.reason'),
      label: t('disciplines.reason'),
      width: '250px',
      render: (_value: unknown, discipline: Discipline) => (
        <div className={styles.detailItem}>
          <span className={`${styles.detailValue} ${styles.truncatedText}`} title={discipline.reason_of_discipline || ''}>
            {discipline.reason_of_discipline && discipline.reason_of_discipline.length > 50
              ? `${discipline.reason_of_discipline.substring(0, 50)}...` 
              : discipline.reason_of_discipline || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'date_of_action_taken',
      title: t('disciplines.dateOfAction'),
      label: t('disciplines.dateOfAction'),
      width: '150px',
      render: (_value: unknown, discipline: Discipline) => (
        <span className={styles.detailValue}>
          {formatDate(discipline.date_of_action_taken)}
        </span>
      )
    },
    {
      key: 'judiciary_intermediate',
      title: t('disciplines.judiciaryIntermediate'),
      label: t('disciplines.judiciaryIntermediate'),
      width: '150px',
      render: (_value: unknown, discipline: Discipline) => (
        <span className={styles.detailValue}>
          {discipline.judiciary_intermediate ? t('common.yes') : t('common.no')}
        </span>
      )
    },
    {
      key: 'resolution_method',
      title: t('disciplines.resolutionMethod'),
      label: t('disciplines.resolutionMethod'),
      width: '150px',
      render: (_value: unknown, discipline: Discipline) => (
        <span className={styles.detailValue}>
          {discipline.resolution_method}
        </span>
      )
    },
    {
      key: 'verdict_for',
      title: t('disciplines.verdictFor'),
      label: t('disciplines.verdictFor'),
      width: '120px',
      render: (_value: unknown, discipline: Discipline) => (
        <span className={styles.detailValue}>
          {discipline.verdict_for || 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      title: t('common.actions'),
      label: t('common.actions'),
      width: '160px',
      render: (_value: unknown, discipline: Discipline) => (
        <div className={styles.disciplineActions}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setSelectedDiscipline(discipline)}
            title={t('common.view')}
          >
            <FaEye size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(discipline)}
            title={t('common.edit')}
          >
            <FaEdit size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(discipline.id)}
            title={t('common.delete')}
          >
            <FaTrash size={16} />
          </Button>
        </div>
      )
    }
  ];

  if (loading && allDisciplines.length === 0) {
    return <Loading />;
  }

  return (
    <div className={styles.disciplinesContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaGavel className="mr-2" />
            {t('disciplines.title')}
          </h1>
          <div className={styles.actions}>
            <Button onClick={handleCreate} size="lg">
              <FaPlus className="mr-2" />
              {t('disciplines.newDiscipline')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filtersGrid}>
            <div className={styles.searchField}>
              <FormField
                label={t('common.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Reset to page 1 when searching
                  setFilters(prev => ({ ...prev, page: 1 }));
                }}
                placeholder="Search by member name..."
              />
            </div>
            <div>
              <label className={styles.filterLabel}>{t('disciplines.union')}</label>
              <select
                value={filters.union_id?.toString() || ''}
                onChange={(e) => setFilters({ ...filters, union_id: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                {unions.map(u => (
                  <option key={u.union_id} value={u.union_id.toString()}>
                    {u.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.filterLabel}>{t('disciplines.disciplineCase')}</label>
              <select
                value={filters.discipline_case || ''}
                onChange={(e) => setFilters({ ...filters, discipline_case: e.target.value || undefined, page: 1 })}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="Warning">Warning</option>
                <option value="Salary Penalty">Salary Penalty</option>
                <option value="Work Suspension">Work Suspension</option>
                <option value="Termination">Termination</option>
              </select>
            </div>
            <div>
              <label className={styles.filterLabel}>{t('disciplines.judiciaryIntermediate')}</label>
              <select
                value={filters.judiciary_intermediate !== undefined ? filters.judiciary_intermediate.toString() : ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  judiciary_intermediate: e.target.value === '' ? undefined : e.target.value === 'true',
                  page: 1 
                })}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="true">{t('common.yes')}</option>
                <option value="false">{t('common.no')}</option>
              </select>
            </div>
            <div>
              <label className={styles.filterLabel}>{t('disciplines.resolutionMethod')}</label>
              <select
                value={filters.resolution_method || ''}
                onChange={(e) => setFilters({ ...filters, resolution_method: e.target.value || undefined, page: 1 })}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="Social Dialog">Social Dialog</option>
                <option value="Judiciary Body">Judiciary Body</option>
              </select>
            </div>
          </div>
          <div className={styles.filterActions}>
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({ page: 1, per_page: 20 });
                setSearchQuery('');
              }}
            >
              {t('common.resetFilters')}
            </Button>
          </div>
        </div>

        {/* Disciplines Table */}
        {error ? (
          <div className={styles.errorState}>
            <div className={styles.errorStateTitle}>{t('common.error')}</div>
            <div className={styles.errorStateDescription}>{error}</div>
            <Button onClick={fetchDisciplines} className="mt-4">
              {t('common.retry')}
            </Button>
          </div>
        ) : disciplines.length === 0 ? (
          <div className={styles.emptyState}>
            <FaGavel className={styles.emptyStateIcon} />
            <div className={styles.emptyStateTitle}>{t('disciplines.noDisciplines')}</div>
            <div className={styles.emptyStateDescription}>
              {Object.keys(filters).length > 2 
                ? t('disciplines.noDisciplinesFiltered')
                : t('disciplines.noDisciplinesDescription')
              }
            </div>
            <Button onClick={handleCreate} size="lg">
              <FaPlus className="mr-2" />
              {t('disciplines.createFirst')}
            </Button>
          </div>
        ) : (
          <DataTable
            data={disciplines}
            columns={columns}
            isLoading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onPerPageChange={(per_page) => setFilters({ ...filters, per_page, page: 1 })}
            currentPage={filters.page || 1}
            perPage={filters.per_page || 20}
            totalItems={filteredDisciplines.length}
            totalPages={Math.ceil(filteredDisciplines.length / (filters.per_page || 20))}
          />
        )}
      </motion.div>

      {/* Form Modal */}
      {showForm && (
        <DisciplineForm
          discipline={editingDiscipline}
          onClose={handleFormClose}
        />
      )}

      {/* View Details Modal */}
      {selectedDiscipline && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDiscipline(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('disciplines.disciplineDetails')}</h2>
              <button onClick={() => setSelectedDiscipline(null)} className={styles.closeButton}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>{t('disciplines.union')}</label>
                  <span className={styles.detailValue}>
                    {selectedDiscipline.union?.name_en || `Union ID: ${selectedDiscipline.union_id}`}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>{t('disciplines.member')}</label>
                  <span className={styles.detailValue}>
                    {selectedDiscipline.member 
                      ? `${selectedDiscipline.member.first_name} ${selectedDiscipline.member.father_name || ''} ${selectedDiscipline.member.surname || ''}`.trim()
                      : `Member ID: ${selectedDiscipline.mem_id}`}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>{t('disciplines.disciplineCase')}</label>
                  <span className={`${styles.caseBadge} ${getCaseColor(selectedDiscipline.discipline_case)}`}>
                    {selectedDiscipline.discipline_case}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>{t('disciplines.reason')}</label>
                  <span className={styles.detailValue}>{selectedDiscipline.reason_of_discipline}</span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>{t('disciplines.dateOfAction')}</label>
                  <span className={styles.detailValue}>
                    {formatDate(selectedDiscipline.date_of_action_taken)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>{t('disciplines.judiciaryIntermediate')}</label>
                  <span className={styles.detailValue}>
                    {selectedDiscipline.judiciary_intermediate ? t('common.yes') : t('common.no')}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>{t('disciplines.resolutionMethod')}</label>
                  <span className={styles.detailValue}>{selectedDiscipline.resolution_method}</span>
                </div>
                {selectedDiscipline.verdict_for && (
                  <div className={styles.detailItem}>
                    <label className={styles.detailLabel}>{t('disciplines.verdictFor')}</label>
                    <span className={styles.detailValue}>{selectedDiscipline.verdict_for}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setSelectedDiscipline(null)}>
                {t('common.close')}
              </Button>
              <Button variant="primary" onClick={() => {
                setSelectedDiscipline(null);
                handleEdit(selectedDiscipline);
              }}>
                {t('common.edit')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title={t('disciplines.deleteTitle')}
        message={t('disciplines.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default Disciplines;


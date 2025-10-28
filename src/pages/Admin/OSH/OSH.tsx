import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getOSHIncidents, 
  deleteOSHIncident, 
  getOSHStatistics,
  OSHIncident,
  OSHIncidentParams,
  OSHStatistics
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { DataTable } from '@components/DataTable/DataTable';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaExclamationTriangle,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaUser
} from 'react-icons/fa';
import { formatDate } from '@utils/formatters';
import { OSHForm } from './OSHForm';
import styles from './OSH.module.css';

export const OSH: React.FC = () => {
  const [incidents, setIncidents] = useState<OSHIncident[]>([]);
  const [statistics, setStatistics] = useState<OSHStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState<OSHIncident | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<OSHIncidentParams>({
    page: 1,
    per_page: 1000  // Get all incidents for statistics
  });

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching incidents with filters:', filters);
      const response = await getOSHIncidents(filters);
      console.log('Fetched incidents count:', response.data.data.length);
      console.log('First incident sample:', response.data.data[0]);
      setIncidents(response.data.data);
    } catch (err) {
      setError('Failed to load OSH incidents');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const response = await getOSHStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setStatistics(null);
    } finally {
      setStatisticsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchStatistics();
  }, [filters]);

  const handleCreate = () => {
    setEditingIncident(null);
    setShowForm(true);
  };

  const handleEdit = (incident: OSHIncident) => {
    console.log('Editing incident:', incident);
    setEditingIncident(incident);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteOSHIncident(deletingId);
      await fetchIncidents();
      await fetchStatistics();
      setShowConfirm(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete incident');
      console.error('Error deleting incident:', err);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingIncident(null);
    fetchIncidents();
    fetchStatistics();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'None': return styles.severityNone;
      case 'Minor': return styles.severityMinor;
      case 'Major': return styles.severityMajor;
      case 'Fatal': return styles.severityFatal;
      default: return styles.severityNone;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return styles.statusOpen;
      case 'investigating': return styles.statusInvestigating;
      case 'closed': return styles.statusClosed;
      default: return styles.statusOpen;
    }
  };

  // Compute statistics from incidents data
  const computedStatistics = React.useMemo(() => {
    if (!incidents || incidents.length === 0) {
      return {
        total_incidents: 0,
        high_severity_count: 0,
        regulatory_reports_required: 0,
        open_cases: 0
      };
    }

    const highSeverity = incidents.filter(i => 
      i.injurySeverity === 'Major' || i.injurySeverity === 'Fatal'
    ).length;

    const regulatoryReports = incidents.filter(i => 
      i.regulatoryReportRequired === true
    ).length;

    const openCases = incidents.filter(i => 
      i.status === 'open'
    ).length;

    return {
      total_incidents: incidents.length,
      high_severity_count: highSeverity,
      regulatory_reports_required: regulatoryReports,
      open_cases: openCases
    };
  }, [incidents]);

  const columns = [
    {
      key: 'id',
      title: 'ID',
      label: 'ID',
      width: '80px',
      render: (_value: unknown, incident: OSHIncident) => (
        <span className={styles.detailValue}>#{incident.id}</span>
      )
    },
    {
      key: 'union',
      title: 'Union',
      label: 'Union',
      width: '200px',
      render: (_value: unknown, incident: OSHIncident) => (
        <span className={styles.detailValue}>
          {incident.union?.name_en || (incident.unionId ? `Union ID: ${incident.unionId}` : 'N/A')}
        </span>
      )
    },
    {
      key: 'accident_category',
      title: 'Category',
      label: 'Category',
      width: '120px',
      render: (_value: unknown, incident: OSHIncident) => (
        <span className={styles.categoryBadge}>
          {incident.accidentCategory || 'Not Set'}
        </span>
      )
    },
    {
      key: 'injury_severity',
      title: 'Severity',
      label: 'Severity',
      width: '120px',
      render: (_value: unknown, incident: OSHIncident) => (
        <span className={`${styles.severityIndicator} ${getSeverityColor(incident.injurySeverity)}`}>
          <FaExclamationTriangle />
          {incident.injurySeverity}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      label: 'Status',
      width: '120px',
      render: (_value: unknown, incident: OSHIncident) => (
        <span className={`${styles.statusBadge} ${getStatusColor(incident.status)}`}>
          {incident.status}
        </span>
      )
    },
    {
      key: 'date_time_occurred',
      title: 'Date',
      label: 'Date',
      width: '150px',
      render: (_value: unknown, incident: OSHIncident) => (
        <span className={styles.detailValue}>
          {formatDate(incident.dateTimeOccurred)}
        </span>
      )
    },
    {
      key: 'location_site',
      title: 'Location',
      label: 'Location',
      width: '200px',
      render: (_value: unknown, incident: OSHIncident) => (
        <div className={styles.detailItem}>
          <span className={styles.detailValue}>
            <FaMapMarkerAlt className="mr-1" />
            {incident.locationSite}
          </span>
          {incident.locationBuilding && (
            <span className={styles.detailValue}>
              {incident.locationBuilding}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'description',
      title: 'Description',
      label: 'Description',
      width: '300px',
      render: (_value: unknown, incident: OSHIncident) => (
        <div className={styles.detailItem}>
          <span className={styles.detailValue}>
            {incident.description && incident.description.length > 100 
              ? `${incident.description.substring(0, 100)}...` 
              : incident.description || 'No description'}
          </span>
          {incident.rootCauses && incident.rootCauses.length > 0 && (
            <div className={styles.rootCausesList}>
              {incident.rootCauses.slice(0, 2).map((cause, index) => (
                <span key={index} className={styles.rootCauseTag}>
                  {cause}
                </span>
              ))}
              {incident.rootCauses.length > 2 && (
                <span className={styles.rootCauseTag}>
                  +{incident.rootCauses.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'reported_by',
      title: 'Reported By',
      label: 'Reported By',
      width: '150px',
      render: (_value: unknown, incident: OSHIncident) => (
        <span className={styles.detailValue}>
          <FaUser className="mr-1" />
          {incident.reportedBy}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      label: 'Actions',
      width: '120px',
      render: (_value: unknown, incident: OSHIncident) => (
        <div className={styles.incidentActions}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(incident)}
            title="Edit"
          >
            <FaEdit />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(incident.id)}
            title="Delete"
          >
            <FaTrash />
          </Button>
        </div>
      )
    }
  ];

  if (loading && incidents.length === 0) {
    return <Loading />;
  }

  return (
    <div className={styles.oshContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaShieldAlt className="mr-2" />
            Occupational Safety & Health (OSH)
          </h1>
          <div className={styles.actions}>
            <Button onClick={handleCreate} size="lg">
              <FaPlus className="mr-2" />
              New Incident
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statisticsLoading ? (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-</div>
              <div className={styles.statLabel}>Loading...</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-</div>
              <div className={styles.statLabel}>Loading...</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-</div>
              <div className={styles.statLabel}>Loading...</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>-</div>
              <div className={styles.statLabel}>Loading...</div>
            </div>
          </div>
        ) : (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{computedStatistics.total_incidents}</div>
              <div className={styles.statLabel}>Total Incidents</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{computedStatistics.high_severity_count}</div>
              <div className={styles.statLabel}>High Severity</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{computedStatistics.regulatory_reports_required}</div>
              <div className={styles.statLabel}>Regulatory Reports</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{computedStatistics.open_cases}</div>
              <div className={styles.statLabel}>Open Cases</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filtersGrid}>
            <div>
              <label className={styles.detailLabel}>Category</label>
              <select
                value={filters.accident_category || ''}
                onChange={(e) => setFilters({ ...filters, accident_category: e.target.value || undefined })}
                className="form-select"
              >
                <option value="">All Categories</option>
                <option value="People">People</option>
                <option value="Property">Property</option>
                <option value="Environment">Environment</option>
                <option value="Process">Process</option>
              </select>
            </div>
            <div>
              <label className={styles.detailLabel}>Severity</label>
              <select
                value={filters.injury_severity || ''}
                onChange={(e) => setFilters({ ...filters, injury_severity: e.target.value || undefined })}
                className="form-select"
              >
                <option value="">All Severities</option>
                <option value="None">None</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Fatal">Fatal</option>
              </select>
            </div>
            <div>
              <label className={styles.detailLabel}>Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="form-select"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className={styles.filterActions}>
            <Button
              variant="secondary"
              onClick={() => setFilters({ page: 1, per_page: 20 })}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Incidents Table */}
        {error ? (
          <div className={styles.errorState}>
            <div className={styles.errorStateTitle}>Error Loading Data</div>
            <div className={styles.errorStateDescription}>{error}</div>
            <Button onClick={fetchIncidents} className="mt-4">
              Retry
            </Button>
          </div>
        ) : incidents.length === 0 ? (
          <div className={styles.emptyState}>
            <FaExclamationTriangle className={styles.emptyStateIcon} />
            <div className={styles.emptyStateTitle}>No Incidents Found</div>
            <div className={styles.emptyStateDescription}>
              {Object.keys(filters).length > 2 
                ? 'No incidents match your current filters. Try adjusting your search criteria.'
                : 'No OSH incidents have been reported yet. Click "New Incident" to create the first one.'
              }
            </div>
            <Button onClick={handleCreate} size="lg">
              <FaPlus className="mr-2" />
              Create First Incident
            </Button>
          </div>
        ) : (
          <DataTable
            data={incidents}
            columns={columns}
            isLoading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onPerPageChange={(per_page) => setFilters({ ...filters, per_page, page: 1 })}
            currentPage={filters.page || 1}
            perPage={filters.per_page || 20}
            totalItems={incidents.length}
          />
        )}
      </motion.div>

      {/* Form Modal */}
      {showForm && (
        <OSHForm
          incident={editingIncident}
          onClose={handleFormClose}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Incident"
        message="Are you sure you want to delete this OSH incident? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default OSH;

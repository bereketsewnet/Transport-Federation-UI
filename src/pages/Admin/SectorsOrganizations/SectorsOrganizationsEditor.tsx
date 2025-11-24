import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getSectors,
  getOrganizations,
  createSector,
  updateSector,
  deleteSector,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  Sector,
  Organization
} from '@api/endpoints';
import { DataTable } from '@components/DataTable/DataTable';
import { Button } from '@components/Button/Button';
import { FormField } from '@components/FormField/FormField';
import { TextArea } from '@components/TextArea/TextArea';
import { Modal } from '@components/Modal/Modal';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { Loading } from '@components/Loading/Loading';
import { toast } from 'react-hot-toast';
import styles from './SectorsOrganizationsEditor.module.css';

type TabType = 'sectors' | 'organizations';

interface SectorFormData {
  name: string;
  description: string;
}

interface OrganizationFormData {
  name: string;
  description: string;
}

export const SectorsOrganizationsEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sectors');
  const [loading, setLoading] = useState(true);
  
  // Sectors state
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorDialog, setSectorDialog] = useState<{
    isOpen: boolean;
    sector: Sector | null;
    mode: 'create' | 'edit';
  }>({ isOpen: false, sector: null, mode: 'create' });
  const [sectorFormData, setSectorFormData] = useState<SectorFormData>({
    name: '',
    description: ''
  });
  const [sectorDeleting, setSectorDeleting] = useState<number | null>(null);
  const [sectorDeleteDialog, setSectorDeleteDialog] = useState<{
    isOpen: boolean;
    sector: Sector | null;
  }>({ isOpen: false, sector: null });
  
  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationDialog, setOrganizationDialog] = useState<{
    isOpen: boolean;
    organization: Organization | null;
    mode: 'create' | 'edit';
  }>({ isOpen: false, organization: null, mode: 'create' });
  const [organizationFormData, setOrganizationFormData] = useState<OrganizationFormData>({
    name: '',
    description: ''
  });
  const [organizationDeleting, setOrganizationDeleting] = useState<number | null>(null);
  const [organizationDeleteDialog, setOrganizationDeleteDialog] = useState<{
    isOpen: boolean;
    organization: Organization | null;
  }>({ isOpen: false, organization: null });

  // Load data
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sectors') {
        const response = await getSectors({ page: 1, per_page: 100 });
        setSectors(response.data.data || []);
      } else {
        const response = await getOrganizations({ page: 1, per_page: 100 });
        setOrganizations(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Sector handlers
  const handleOpenSectorDialog = (mode: 'create' | 'edit', sector?: Sector) => {
    if (mode === 'edit' && sector) {
      setSectorFormData({
        name: sector.name || '',
        description: sector.description || ''
      });
      setSectorDialog({ isOpen: true, sector, mode: 'edit' });
    } else {
      setSectorFormData({ name: '', description: '' });
      setSectorDialog({ isOpen: true, sector: null, mode: 'create' });
    }
  };

  const handleCloseSectorDialog = () => {
    setSectorDialog({ isOpen: false, sector: null, mode: 'create' });
    setSectorFormData({ name: '', description: '' });
  };

  const handleSaveSector = async () => {
    if (!sectorFormData.name.trim()) {
      toast.error('Sector name is required');
      return;
    }

    try {
      if (sectorDialog.mode === 'create') {
        await createSector(sectorFormData);
        toast.success('Sector created successfully');
      } else if (sectorDialog.sector) {
        await updateSector(sectorDialog.sector.id, sectorFormData);
        toast.success('Sector updated successfully');
      }
      handleCloseSectorDialog();
      loadData();
    } catch (err: any) {
      console.error('Error saving sector:', err);
      toast.error(err.response?.data?.message || 'Failed to save sector');
    }
  };

  const handleDeleteSector = async () => {
    if (!sectorDeleteDialog.sector) return;

    try {
      setSectorDeleting(sectorDeleteDialog.sector.id);
      await deleteSector(sectorDeleteDialog.sector.id, true);
      toast.success('Sector deleted successfully');
      setSectorDeleteDialog({ isOpen: false, sector: null });
      loadData();
    } catch (err: any) {
      console.error('Error deleting sector:', err);
      toast.error(err.response?.data?.message || 'Failed to delete sector');
    } finally {
      setSectorDeleting(null);
    }
  };

  // Organization handlers
  const handleOpenOrganizationDialog = (mode: 'create' | 'edit', organization?: Organization) => {
    if (mode === 'edit' && organization) {
      setOrganizationFormData({
        name: organization.name || '',
        description: organization.description || ''
      });
      setOrganizationDialog({ isOpen: true, organization, mode: 'edit' });
    } else {
      setOrganizationFormData({ name: '', description: '' });
      setOrganizationDialog({ isOpen: true, organization: null, mode: 'create' });
    }
  };

  const handleCloseOrganizationDialog = () => {
    setOrganizationDialog({ isOpen: false, organization: null, mode: 'create' });
    setOrganizationFormData({ name: '', description: '' });
  };

  const handleSaveOrganization = async () => {
    if (!organizationFormData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      if (organizationDialog.mode === 'create') {
        await createOrganization(organizationFormData);
        toast.success('Organization created successfully');
      } else if (organizationDialog.organization) {
        await updateOrganization(organizationDialog.organization.id, organizationFormData);
        toast.success('Organization updated successfully');
      }
      handleCloseOrganizationDialog();
      loadData();
    } catch (err: any) {
      console.error('Error saving organization:', err);
      toast.error(err.response?.data?.message || 'Failed to save organization');
    }
  };

  const handleDeleteOrganization = async () => {
    if (!organizationDeleteDialog.organization) return;

    try {
      setOrganizationDeleting(organizationDeleteDialog.organization.id);
      await deleteOrganization(organizationDeleteDialog.organization.id, true);
      toast.success('Organization deleted successfully');
      setOrganizationDeleteDialog({ isOpen: false, organization: null });
      loadData();
    } catch (err: any) {
      console.error('Error deleting organization:', err);
      toast.error(err.response?.data?.message || 'Failed to delete organization');
    } finally {
      setOrganizationDeleting(null);
    }
  };

  // Table columns for sectors
  const sectorColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '30%',
    },
    {
      key: 'description',
      label: 'Description',
      width: '50%',
      render: (_value: unknown, row: Sector) => row?.description || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '20%',
      render: (_value: unknown, row: Sector) => (
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenSectorDialog('edit', row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSectorDeleteDialog({ isOpen: true, sector: row })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Table columns for organizations
  const organizationColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '30%',
    },
    {
      key: 'description',
      label: 'Description',
      width: '50%',
      render: (_value: unknown, row: Organization) => row?.description || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '20%',
      render: (_value: unknown, row: Organization) => (
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenOrganizationDialog('edit', row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setOrganizationDeleteDialog({ isOpen: true, organization: row })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sectors & Organizations Editor</h1>
          <p className={styles.subtitle}>Manage sectors and organizations for union registration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'sectors' ? styles.active : ''}`}
          onClick={() => setActiveTab('sectors')}
        >
          Sectors
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'organizations' ? styles.active : ''}`}
          onClick={() => setActiveTab('organizations')}
        >
          Organizations
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'sectors' ? (
          <>
            <div className={styles.toolbar}>
              <Button
                onClick={() => handleOpenSectorDialog('create')}
                size="lg"
              >
                + Add Sector
              </Button>
            </div>
            <DataTable
              data={sectors}
              columns={sectorColumns}
            />
          </>
        ) : (
          <>
            <div className={styles.toolbar}>
              <Button
                onClick={() => handleOpenOrganizationDialog('create')}
                size="lg"
              >
                + Add Organization
              </Button>
            </div>
            <DataTable
              data={organizations}
              columns={organizationColumns}
            />
          </>
        )}
      </div>

      {/* Sector Dialog */}
      <Modal
        isOpen={sectorDialog.isOpen}
        onClose={handleCloseSectorDialog}
        title={sectorDialog.mode === 'create' ? 'Add Sector' : 'Edit Sector'}
      >
        <div className={styles.form}>
          <FormField
            label="Name *"
            value={sectorFormData.name}
            onChange={(e) => setSectorFormData({ ...sectorFormData, name: e.target.value })}
            required
            placeholder="e.g., Aviation"
          />
          <TextArea
            label="Description"
            value={sectorFormData.description}
            onChange={(e) => setSectorFormData({ ...sectorFormData, description: e.target.value })}
            placeholder="Optional description"
            rows={3}
          />
          <div className={styles.formActions}>
            <Button
              variant="secondary"
              onClick={handleCloseSectorDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSector}
            >
              {sectorDialog.mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Organization Dialog */}
      <Modal
        isOpen={organizationDialog.isOpen}
        onClose={handleCloseOrganizationDialog}
        title={organizationDialog.mode === 'create' ? 'Add Organization' : 'Edit Organization'}
      >
        <div className={styles.form}>
          <FormField
            label="Name *"
            value={organizationFormData.name}
            onChange={(e) => setOrganizationFormData({ ...organizationFormData, name: e.target.value })}
            required
            placeholder="e.g., Ethiopian Airlines Group"
          />
          <TextArea
            label="Description"
            value={organizationFormData.description}
            onChange={(e) => setOrganizationFormData({ ...organizationFormData, description: e.target.value })}
            placeholder="Optional description"
            rows={3}
          />
          <div className={styles.formActions}>
            <Button
              variant="secondary"
              onClick={handleCloseOrganizationDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrganization}
            >
              {organizationDialog.mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sector Delete Confirmation */}
      <ConfirmDialog
        isOpen={sectorDeleteDialog.isOpen}
        onClose={() => setSectorDeleteDialog({ isOpen: false, sector: null })}
        onConfirm={handleDeleteSector}
        title="Delete Sector"
        message={`Are you sure you want to delete "${sectorDeleteDialog.sector?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={sectorDeleting === sectorDeleteDialog.sector?.id}
      />

      {/* Organization Delete Confirmation */}
      <ConfirmDialog
        isOpen={organizationDeleteDialog.isOpen}
        onClose={() => setOrganizationDeleteDialog({ isOpen: false, organization: null })}
        onConfirm={handleDeleteOrganization}
        title="Delete Organization"
        message={`Are you sure you want to delete "${organizationDeleteDialog.organization?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={organizationDeleting === organizationDeleteDialog.organization?.id}
      />
    </motion.div>
  );
};

export default SectorsOrganizationsEditor;


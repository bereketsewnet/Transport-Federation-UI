import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  getUnions, 
  updateUnion, 
  Union 
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { DataTable, Column } from '@components/DataTable/DataTable';
import { Loading } from '@components/Loading/Loading';
import { Modal } from '@components/Modal/Modal';
import { ConfirmDialog } from '@components/ConfirmDialog/ConfirmDialog';
import { FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '@utils/formatters';
import styles from './GeneralAssembly.module.css';

export const GeneralAssembly: React.FC = () => {
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUnion, setEditingUnion] = useState<Union | null>(null);
  const [assemblyDate, setAssemblyDate] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; union: Union | null }>({
    isOpen: false,
    union: null,
  });

  useEffect(() => {
    fetchUnions();
  }, []);

  const fetchUnions = async () => {
    setLoading(true);
    try {
      const response = await getUnions({ per_page: 1000 });
      
      // Transform unions to ensure 'id' field exists (fixes React key warning)
      const transformedUnions: Union[] = response.data.data.map((u: any) => ({
        ...u,
        id: u.id || u.union_id, // Handle both id and union_id
      }));
      
      setUnions(transformedUnions);
    } catch (error) {
      console.error('Failed to fetch unions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (union: Union) => {
    setEditingUnion(union);
    setAssemblyDate(union.general_assembly_date || '');
  };

  const handleSave = async () => {
    if (!editingUnion) return;

    setSaveLoading(true);
    try {
      const unionId = editingUnion.id || editingUnion.union_id;
      await updateUnion(unionId, {
        general_assembly_date: assemblyDate || null,
      });
      await fetchUnions();
      setEditingUnion(null);
      setAssemblyDate('');
    } catch (error) {
      console.error('Failed to update union:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.union) return;

    try {
      const unionId = deleteDialog.union.id || deleteDialog.union.union_id;
      await updateUnion(unionId, {
        general_assembly_date: null,
      });
      await fetchUnions();
      setDeleteDialog({ isOpen: false, union: null });
    } catch (error) {
      console.error('Failed to delete assembly date:', error);
    }
  };

  const columns: Column<Union>[] = [
    {
      key: 'name_en',
      label: 'Union Name',
      render: (_value: unknown, union: Union) => (
        <div className={styles.unionInfo}>
          <div className={styles.unionName}>{union.name_en}</div>
          <div className={styles.unionCode}>{union.union_code}</div>
        </div>
      ),
    },
    {
      key: 'sector',
      label: 'Sector',
      render: (_value: unknown, union: Union) => (
        <span className={styles.sectorBadge}>{union.sector}</span>
      ),
    },
    {
      key: 'general_assembly_date',
      label: 'Last Assembly Date',
      render: (_value: unknown, union: Union) => (
        <span className={styles.dateValue}>
          {union.general_assembly_date ? formatDate(union.general_assembly_date) : (
            <span className={styles.noDate}>Not Set</span>
          )}
        </span>
      ),
    },
    {
      key: 'days_since',
      label: 'Days Since',
      render: (_value: unknown, union: Union) => {
        if (!union.general_assembly_date) return <span>-</span>;
        
        // Calculate: today - assembly_date
        // Positive = past (assembly happened X days ago)
        // Negative = future (assembly is in X days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const assemblyDate = new Date(union.general_assembly_date);
        assemblyDate.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - assemblyDate.getTime();
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Display: positive for past, negative for future
        if (days >= 0) {
          return <span className={days > 365 ? styles.overdue : styles.active}>{days} days ago</span>;
        } else {
          return <span className={styles.upcoming}>{Math.abs(days)} days until</span>;
        }
      },
    },
  ];

  // Row actions
  const rowActions = (union: Union) => (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(union);
        }}
      >
        <FaEdit /> Edit
      </Button>
      {union.general_assembly_date && (
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteDialog({ isOpen: true, union });
          }}
        >
          <FaTrash /> Delete
        </Button>
      )}
    </>
  );

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FaCalendarAlt className="mr-2" />
              General Assembly Management
            </h1>
            <p className={styles.subtitle}>
              Manage General Assembly dates for unions
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={unions}
          actions={rowActions}
          isLoading={loading}
          emptyMessage="No unions found"
        />

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingUnion}
          onClose={() => setEditingUnion(null)}
          title="Edit General Assembly Date"
        >
          {editingUnion && (
            <div className={styles.modalContent}>
              <p className={styles.modalInfo}>
                Union: <strong>{editingUnion.name_en}</strong>
              </p>
              <label className={styles.label}>
                General Assembly Date
                <input
                  type="date"
                  value={assemblyDate}
                  onChange={(e) => setAssemblyDate(e.target.value)}
                  className={styles.dateInput}
                />
              </label>
              <div className={styles.modalActions}>
                <Button
                  onClick={handleSave}
                  isLoading={saveLoading}
                  disabled={saveLoading}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditingUnion(null)}
                  disabled={saveLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, union: null })}
          onConfirm={handleDelete}
          title="Remove Assembly Date"
          message={`Are you sure you want to remove the General Assembly date for ${deleteDialog.union?.name_en}?`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      </motion.div>
    </div>
  );
};

export default GeneralAssembly;


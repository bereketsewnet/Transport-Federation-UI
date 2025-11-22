import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  createDiscipline, 
  updateDiscipline, 
  getUnions,
  getMembers,
  Discipline,
  Union,
  Member
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { Modal } from '@components/Modal/Modal';
import { TextArea } from '@components/TextArea/TextArea';
import { 
  FaTimes, 
  FaSave, 
  FaUser
} from 'react-icons/fa';
import styles from './DisciplineForm.module.css'; 

interface DisciplineFormProps {
  discipline?: Discipline | null;
  onClose: () => void;
}

export const DisciplineForm: React.FC<DisciplineFormProps> = ({ discipline, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [unions, setUnions] = useState<Union[]>([]);
  const [memberCode, setMemberCode] = useState('');
  const [memberSearchResult, setMemberSearchResult] = useState<Member | null>(null);
  const [searchingMember, setSearchingMember] = useState(false);
  const [formData, setFormData] = useState<Partial<Discipline>>({
    union_id: 0,
    mem_id: 0,
    discipline_case: 'Warning',
    reason_of_discipline: '',
    date_of_action_taken: new Date().toISOString().slice(0, 10),
    judiciary_intermediate: false,
    resolution_method: 'Social Dialog',
    verdict_for: null
  });

  const disciplineCaseOptions = [
    { value: 'Warning', label: 'Warning' },
    { value: 'Salary Penalty', label: 'Salary Penalty' },
    { value: 'Work Suspension', label: 'Work Suspension' },
    { value: 'Termination', label: 'Termination' }
  ];

  const resolutionMethodOptions = [
    { value: 'Social Dialog', label: 'Social Dialog' },
    { value: 'Judiciary Body', label: 'Judiciary Body' }
  ];

  const verdictForOptions = [
    { value: '', label: 'None' },
    { value: 'Worker', label: 'Worker' },
    { value: 'Employer', label: 'Employer' }
  ];

  useEffect(() => {
    const fetchUnions = async () => {
      try {
        const response = await getUnions({ per_page: 1000 });
        setUnions(response.data.data);
      } catch (err) {
      }
    };

    fetchUnions();

    if (discipline) {
      const formDataToSet = {
        ...discipline,
        date_of_action_taken: discipline.date_of_action_taken 
          ? new Date(discipline.date_of_action_taken).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      };
      setFormData(formDataToSet);
      // If editing, try to get member_code from member data
      if (discipline.member?.member_code) {
        setMemberCode(discipline.member.member_code);
        setMemberSearchResult(discipline.member as any);
      } else if (discipline.mem_id) {
        // Try to fetch member by mem_id to get member_code
        fetchMemberByCodeOrId(discipline.mem_id.toString());
      }
    }
  }, [discipline]);

  const fetchMemberByCodeOrId = async (codeOrId: string) => {
    if (!codeOrId || !codeOrId.trim()) {
      setMemberSearchResult(null);
      setFormData(prev => ({ ...prev, mem_id: 0 }));
      return;
    }

    try {
      setSearchingMember(true);
      // Search by member_code using q parameter
      const response = await getMembers({ q: codeOrId.trim(), per_page: 10 });
      const members = response.data.data || [];
      
      // Try to find exact match by member_code first
      let foundMember = members.find((m: Member) => 
        m.member_code?.toLowerCase() === codeOrId.trim().toLowerCase()
      );
      
      // If not found, try by mem_id
      if (!foundMember) {
        const memIdNum = parseInt(codeOrId.trim(), 10);
        if (!isNaN(memIdNum)) {
          foundMember = members.find((m: Member) => m.mem_id === memIdNum);
        }
      }
      
      if (foundMember) {
        setMemberSearchResult(foundMember);
        setFormData(prev => ({ ...prev, mem_id: foundMember.mem_id }));
        setMemberCode(foundMember.member_code);
      } else {
        setMemberSearchResult(null);
        setFormData(prev => ({ ...prev, mem_id: 0 }));
      }
    } catch (err) {
      console.error('Error searching for member:', err);
      setMemberSearchResult(null);
      setFormData(prev => ({ ...prev, mem_id: 0 }));
    } finally {
      setSearchingMember(false);
    }
  };

  // Debounce member code search
  useEffect(() => {
    if (!memberCode || !memberCode.trim()) {
      setMemberSearchResult(null);
      setFormData(prev => ({ ...prev, mem_id: 0 }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      const codeOrId = memberCode.trim();
      if (!codeOrId) {
        setMemberSearchResult(null);
        setFormData(prev => ({ ...prev, mem_id: 0 }));
        return;
      }

      try {
        setSearchingMember(true);
        // Search by member_code using q parameter
        const response = await getMembers({ q: codeOrId, per_page: 10 });
        const members = response.data.data || [];
        
        // Try to find exact match by member_code first
        let foundMember = members.find((m: Member) => 
          m.member_code?.toLowerCase() === codeOrId.toLowerCase()
        );
        
        // If not found, try by mem_id
        if (!foundMember) {
          const memIdNum = parseInt(codeOrId, 10);
          if (!isNaN(memIdNum)) {
            foundMember = members.find((m: Member) => m.mem_id === memIdNum);
          }
        }
        
        if (foundMember) {
          setMemberSearchResult(foundMember);
          setFormData(prev => ({ ...prev, mem_id: foundMember.mem_id }));
        } else {
          setMemberSearchResult(null);
          setFormData(prev => ({ ...prev, mem_id: 0 }));
        }
      } catch (err) {
        console.error('Error searching for member:', err);
        setMemberSearchResult(null);
        setFormData(prev => ({ ...prev, mem_id: 0 }));
      } finally {
        setSearchingMember(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [memberCode]);

  const handleInputChange = (field: keyof Discipline, value: any) => {
    let cleanValue = value;
    
    // Special handling for union_id to ensure it's a number
    if (field === 'union_id') {
      if (typeof value === 'string') {
        cleanValue = parseInt(value, 10);
      } else if (typeof value === 'number') {
        cleanValue = value;
      } else {
        cleanValue = 0;
      }
      
      if (isNaN(cleanValue)) {
        cleanValue = 0;
      }

      // When union changes, reset member if needed
      if (cleanValue !== formData.union_id) {
        setFormData(prev => ({
          ...prev,
          union_id: cleanValue,
        }));
        return;
      }
    }

    // Special handling for judiciary_intermediate
    if (field === 'judiciary_intermediate') {
      cleanValue = value === true || value === 'true' || value === 'Yes';
    }

    // Special handling for verdict_for
    if (field === 'verdict_for') {
      cleanValue = value === '' || value === null ? null : value;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));

    // Clear field error when user starts typing/selecting
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'union_id':
        if (!value || value === 0 || isNaN(value)) {
          return t('disciplines.errors.unionRequired');
        }
        return '';
      case 'mem_id':
        if (!value || value === 0 || isNaN(value)) {
          return t('disciplines.errors.memberRequired');
        }
        return '';
      case 'member_code':
        if (!memberCode || !memberCode.trim()) {
          return t('disciplines.errors.memberCodeRequired');
        }
        if (!memberSearchResult) {
          return t('disciplines.errors.memberNotFound');
        }
        return '';
      case 'discipline_case':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return t('disciplines.errors.caseRequired');
        }
        return '';
      case 'reason_of_discipline':
        if (!value || value.trim() === '') {
          return t('disciplines.errors.reasonRequired');
        }
        return '';
      case 'date_of_action_taken':
        if (!value || value.trim() === '') {
          return t('disciplines.errors.dateRequired');
        }
        return '';
      case 'resolution_method':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return t('disciplines.errors.resolutionRequired');
        }
        return '';
      default:
        return '';
    }
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    const requiredFields = [
      'union_id', 'discipline_case', 
      'reason_of_discipline', 'date_of_action_taken', 'resolution_method'
    ];

    // Validate member_code separately
    if (!memberCode || !memberCode.trim()) {
      errors.member_code = t('disciplines.errors.memberCodeRequired');
      isValid = false;
    } else if (!memberSearchResult) {
      errors.member_code = t('disciplines.errors.memberNotFound');
      isValid = false;
    } else if (!formData.mem_id || formData.mem_id === 0) {
      errors.mem_id = t('disciplines.errors.memberRequired');
      isValid = false;
    }

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof Discipline]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    // Verdict For is optional, no validation needed

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      setError(t('disciplines.errors.fixErrors'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData: Partial<Discipline> = {
        union_id: Number(formData.union_id) || 0,
        mem_id: Number(formData.mem_id) || 0,
        discipline_case: (formData.discipline_case || 'Warning') as Discipline['discipline_case'],
        reason_of_discipline: String(formData.reason_of_discipline || ''),
        date_of_action_taken: String(formData.date_of_action_taken || ''),
        judiciary_intermediate: Boolean(formData.judiciary_intermediate),
        resolution_method: (formData.resolution_method || 'Social Dialog') as Discipline['resolution_method'],
        verdict_for: formData.verdict_for || null
      };

      if (discipline) {
        await updateDiscipline(discipline.id, submitData);
      } else {
        await createDiscipline(submitData);
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving discipline:', err);
      const errorMessage = err.response?.data?.message || err.message || t('disciplines.errors.saveFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={discipline ? t('disciplines.editDiscipline') : t('disciplines.newDiscipline')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.errorMessage}
          >
            {error}
          </motion.div>
        )}

        <div className={styles.formGrid}>
          {/* Union Selection */}
          <div className={styles.formField}>
            <label className={styles.label}>
              {t('disciplines.union')} <span className={styles.required}>*</span>
            </label>
            <select
              value={formData.union_id?.toString() || ''}
              onChange={(e) => handleInputChange('union_id', e.target.value)}
              className={styles.input}
            >
              <option value="">{t('disciplines.selectUnion')}</option>
              {unions.map(u => (
                <option key={u.union_id || u.id} value={(u.union_id || u.id).toString()}>
                  {u.name_en}
                </option>
              ))}
            </select>
            {fieldErrors.union_id && (
              <span className={styles.fieldError}>{fieldErrors.union_id}</span>
            )}
          </div>

          {/* Member Code Input */}
          <div className={styles.formField}>
            <label className={styles.label}>
              {t('disciplines.memberCode')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              placeholder={t('disciplines.memberCodePlaceholder')}
              className={styles.input}
              disabled={searchingMember}
            />
            {searchingMember && (
              <span className={styles.searchingText}>{t('common.loading')}...</span>
            )}
            {memberSearchResult && (
              <div className={styles.memberFound}>
                <FaUser className="mr-2" />
                <span>
                  {memberSearchResult.first_name} {memberSearchResult.father_name || ''} {memberSearchResult.surname || ''}
                </span>
                <span className={styles.memberCodeDisplay}>({memberSearchResult.member_code})</span>
              </div>
            )}
            {(fieldErrors.member_code || fieldErrors.mem_id) && (
              <span className={styles.fieldError}>
                {fieldErrors.member_code || fieldErrors.mem_id}
              </span>
            )}
          </div>

          {/* Discipline Case */}
          <div className={styles.formField}>
            <label className={styles.label}>
              {t('disciplines.disciplineCase')} <span className={styles.required}>*</span>
            </label>
            <select
              value={formData.discipline_case || 'Warning'}
              onChange={(e) => handleInputChange('discipline_case', e.target.value)}
              className={styles.input}
            >
              {disciplineCaseOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.discipline_case && (
              <span className={styles.fieldError}>{fieldErrors.discipline_case}</span>
            )}
          </div>

          {/* Date of Action Taken */}
          <div className={styles.formField}>
            <label className={styles.label}>
              {t('disciplines.dateOfAction')} <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              value={formData.date_of_action_taken || ''}
              onChange={(e) => handleInputChange('date_of_action_taken', e.target.value)}
              className={styles.input}
            />
            {fieldErrors.date_of_action_taken && (
              <span className={styles.fieldError}>{fieldErrors.date_of_action_taken}</span>
            )}
          </div>

          {/* Reason of Discipline */}
          <div className={styles.formFieldFull}>
            <label className={styles.label}>
              {t('disciplines.reason')} <span className={styles.required}>*</span>
            </label>
            <TextArea
              value={formData.reason_of_discipline || ''}
              onChange={(e) => handleInputChange('reason_of_discipline', e.target.value)}
              rows={4}
              placeholder={t('disciplines.reasonPlaceholder')}
            />
            {fieldErrors.reason_of_discipline && (
              <span className={styles.fieldError}>{fieldErrors.reason_of_discipline}</span>
            )}
          </div>

          {/* Judiciary Intermediate */}
          <div className={styles.formField}>
            <label className={styles.label}>
              {t('disciplines.judiciaryIntermediate')}
            </label>
            <select
              value={formData.judiciary_intermediate ? 'true' : 'false'}
              onChange={(e) => handleInputChange('judiciary_intermediate', e.target.value === 'true')}
              className={styles.input}
            >
              <option value="false">{t('common.no')}</option>
              <option value="true">{t('common.yes')}</option>
            </select>
          </div>

          {/* Resolution Method */}
          <div className={styles.formField}>
            <label className={styles.label}>
              {t('disciplines.resolutionMethod')} <span className={styles.required}>*</span>
            </label>
            <select
              value={formData.resolution_method || 'Social Dialog'}
              onChange={(e) => handleInputChange('resolution_method', e.target.value)}
              className={styles.input}
            >
              {resolutionMethodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.resolution_method && (
              <span className={styles.fieldError}>{fieldErrors.resolution_method}</span>
            )}
          </div>

          {/* Verdict For */}
          <div className={styles.formField}>
            <label className={styles.label}>
              {t('disciplines.verdictFor')}
            </label>
            <select
              value={formData.verdict_for || ''}
              onChange={(e) => handleInputChange('verdict_for', e.target.value || null)}
              className={styles.input}
            >
              {verdictForOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.verdict_for && (
              <span className={styles.fieldError}>{fieldErrors.verdict_for}</span>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes className="mr-2" />
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <FaSave className="mr-2" />
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  createOSHIncident, 
  updateOSHIncident, 
  getUnions,
  OSHIncident,
  Union
} from '@api/endpoints';
import { Button } from '@components/Button/Button';
import { Modal } from '@components/Modal/Modal';
import { Select } from '@components/Select/Select';
import { TextArea } from '@components/TextArea/TextArea';
import { 
  FaTimes, 
  FaSave, 
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaShieldAlt,
  FaUser,
  FaCog,
  FaPlus
} from 'react-icons/fa';
import styles from './OSHForm.module.css';

interface OSHFormProps {
  incident?: OSHIncident | null;
  onClose: () => void;
}

export const OSHForm: React.FC<OSHFormProps> = ({ incident, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [unions, setUnions] = useState<Union[]>([]);
  const [formData, setFormData] = useState<Partial<OSHIncident>>({
    unionId: 0,
    accidentCategory: 'People',
    dateTimeOccurred: new Date().toISOString().slice(0, 16),
    locationSite: '',
    locationBuilding: '',
    locationArea: '',
    locationGpsLatitude: undefined,
    locationGpsLongitude: undefined,
    injurySeverity: 'None',
    damageSeverity: 'None',
    rootCauses: [],
    description: '',
    regulatoryReportRequired: false,
    status: 'open',
    reportedBy: '',
    investigationNotes: '',
    correctiveActions: '',
    preventiveMeasures: ''
  });

  const accidentCategories = [
    { value: 'People', label: 'People' },
    { value: 'Property', label: 'Property' },
    { value: 'Environment', label: 'Environment' },
    { value: 'Process', label: 'Process' }
  ];

  const injurySeverityOptions = [
    { value: 'None', label: 'None' },
    { value: 'Near-Miss', label: 'Near-Miss' },
    { value: 'First Aid Case (FAC)', label: 'First Aid Case (FAC)' },
    { value: 'Medical Treatment Case (MTC)', label: 'Medical Treatment Case (MTC)' },
    { value: 'Restricted Work Case (RWC)', label: 'Restricted Work Case (RWC)' },
    { value: 'Permanent Disability/Major Injury', label: 'Permanent Disability/Major Injury' },
    { value: 'Fatality', label: 'Fatality' }
  ];

  const damageSeverityOptions = [
    { value: 'None', label: 'None' },
    { value: 'Minor', label: 'Minor' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Major', label: 'Major' },
    { value: 'Severe/Critical', label: 'Severe/Critical' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'investigating', label: 'Under Investigation' },
    { value: 'closed', label: 'Closed' }
  ];

  useEffect(() => {
    const fetchUnions = async () => {
      try {
        const response = await getUnions({ per_page: 1000 });
        console.log('Fetched unions response:', response);
        console.log('Unions data:', response.data.data);
        console.log('First union:', response.data.data[0]);
        console.log('First union ID:', response.data.data[0]?.union_id, typeof response.data.data[0]?.union_id);
        setUnions(response.data.data);
      } catch (err) {
        console.error('Error fetching unions:', err);
      }
    };

    fetchUnions();

    if (incident) {
      console.log('Editing incident in form:', incident);
      const formDataToSet = {
        ...incident,
        dateTimeOccurred: incident.dateTimeOccurred 
          ? new Date(incident.dateTimeOccurred).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      };
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
    }
  }, [incident]);

  const handleInputChange = (field: keyof OSHIncident, value: any) => {
    console.log(`Setting ${field} to:`, value, typeof value);
    
    // Ensure we're not storing DOM elements or circular references
    let cleanValue = value;
    if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'HTMLOptionElement') {
      console.error('Attempted to store HTMLOptionElement in formData!');
      return;
    }
    
    // Special handling for unionId to ensure it's a number
    if (field === 'unionId') {
      if (typeof value === 'string') {
        cleanValue = parseInt(value, 10);
        console.log(`Converting union_id from string "${value}" to number:`, cleanValue);
      } else if (typeof value === 'number') {
        cleanValue = value;
        console.log(`Union_id is already a number:`, cleanValue);
      } else {
        console.error(`Invalid union_id value type:`, typeof value, value);
        cleanValue = 0;
      }
      
      if (isNaN(cleanValue)) {
        console.error(`Union_id conversion resulted in NaN:`, value);
        cleanValue = 0;
      }
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

  const handleRootCauseChange = (index: number, value: string) => {
    const newRootCauses = [...(formData.rootCauses || [])];
    newRootCauses[index] = value;
    setFormData(prev => ({
      ...prev,
      rootCauses: newRootCauses
    }));
  };

  const addRootCause = () => {
    setFormData(prev => ({
      ...prev,
      rootCauses: [...(prev.rootCauses || []), '']
    }));
  };

  const removeRootCause = (index: number) => {
    const newRootCauses = [...(formData.rootCauses || [])];
    newRootCauses.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      rootCauses: newRootCauses
    }));
  };

  const validateField = (field: string, value: any): string => {
    console.log(`Validating ${field}:`, value, typeof value);
    switch (field) {
      case 'unionId':
        if (!value || value === 0 || isNaN(value) || (typeof value === 'object' && value.constructor && value.constructor.name === 'SyntheticBaseEvent')) {
          return 'Please select a union';
        }
        return '';
      case 'accidentCategory':
        if (!value || typeof value !== 'string' || value.trim() === '') return 'Please select an accident category';
        return '';
      case 'dateTimeOccurred':
        if (!value || value.trim() === '') return 'Please select date and time';
        return '';
      case 'locationSite':
        if (!value || value.trim() === '') return 'Please enter the location site';
        return '';
      case 'injurySeverity':
        if (!value || typeof value !== 'string' || value.trim() === '') return 'Please select injury severity';
        return '';
      case 'damageSeverity':
        if (!value || typeof value !== 'string' || value.trim() === '') return 'Please select damage severity';
        return '';
      case 'reportedBy':
        if (!value || value.trim() === '') return 'Please enter who reported the incident';
        return '';
      case 'description':
        if (!value || value.trim() === '') return 'Please enter a description of the incident';
        return '';
      case 'status':
        if (!value || typeof value !== 'string' || value.trim() === '') return 'Please select status';
        return '';
      default:
        return '';
    }
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    console.log('Current formData:', formData);
    console.log('Current formData.unionId:', formData.unionId, typeof formData.unionId);

    // Validate each required field
    const requiredFields = [
      'unionId', 'accidentCategory', 'dateTimeOccurred', 
      'locationSite', 'injurySeverity', 'damageSeverity', 
      'reportedBy', 'description', 'status'
    ];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof OSHIncident]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      setError('Please fix the errors below before submitting');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Form data before submission:', formData);
      console.log('accidentCategory value:', formData.accidentCategory, typeof formData.accidentCategory);

      // Create a completely clean copy of the data
      const submitData: Partial<OSHIncident> = {
        unionId: Number(formData.unionId) || 0,
        accidentCategory: (formData.accidentCategory || '') as OSHIncident['accidentCategory'],
        dateTimeOccurred: String(formData.dateTimeOccurred || ''),
        locationSite: String(formData.locationSite || ''),
        locationBuilding: formData.locationBuilding ? String(formData.locationBuilding) : undefined,
        locationArea: formData.locationArea ? String(formData.locationArea) : undefined,
        locationGpsLatitude: formData.locationGpsLatitude !== undefined && formData.locationGpsLatitude !== null
          ? Number(formData.locationGpsLatitude)
          : undefined,
        locationGpsLongitude: formData.locationGpsLongitude !== undefined && formData.locationGpsLongitude !== null
          ? Number(formData.locationGpsLongitude)
          : undefined,
        injurySeverity: (formData.injurySeverity || 'None') as OSHIncident['injurySeverity'],
        damageSeverity: (formData.damageSeverity || 'None') as OSHIncident['damageSeverity'],
        rootCauses: Array.isArray(formData.rootCauses)
          ? formData.rootCauses.filter((cause): cause is string => typeof cause === 'string' && cause.trim() !== '')
          : [],
        description: String(formData.description || ''),
        regulatoryReportRequired: Boolean(formData.regulatoryReportRequired),
        status: (formData.status || 'open') as OSHIncident['status'],
        reportedBy: String(formData.reportedBy || ''),
        investigationNotes: formData.investigationNotes ? String(formData.investigationNotes) : undefined,
        correctiveActions: formData.correctiveActions ? String(formData.correctiveActions) : undefined,
        preventiveMeasures: formData.preventiveMeasures ? String(formData.preventiveMeasures) : undefined,
      };

      console.log('Submit data:', submitData);

      if (incident) {
        await updateOSHIncident(incident.id, submitData);
      } else {
        await createOSHIncident(submitData);
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save incident');
      console.error('Error saving incident:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={styles.formContainer}
      >
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            <FaShieldAlt className="mr-2" />
            {incident ? 'Edit OSH Incident' : 'Create New OSH Incident'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              <FaExclamationTriangle className="mr-2" />
              {error}
            </div>
          )}

          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <FaUser className="mr-2" />
                Basic Information
              </h3>
              
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Union <span className={styles.required}>*</span>
                  </label>
                  <select
                    value={formData.unionId || 0}
                    onChange={(e) => {
                      const stringValue = e.target.value;
                      if (stringValue === '' || stringValue === '0') {
                        handleInputChange('unionId', 0);
                      } else {
                        const numericValue = parseInt(stringValue, 10);
                        if (!isNaN(numericValue)) {
                          handleInputChange('unionId', numericValue);
                        }
                      }
                    }}
                    className={`form-input ${fieldErrors.unionId ? 'error' : ''}`}
                  >
                    <option value={0}>Select Union</option>
                    {unions.map((union, index) => (
                      <option key={`union-${union.union_id}-${index}`} value={union.union_id}>
                        {union.name_en} ({union.union_code})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.unionId && (
                    <div className={styles.fieldError}>{fieldErrors.unionId}</div>
                  )}
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Accident Category <span className={styles.required}>*</span>
                  </label>
                  <Select
                    value={formData.accidentCategory || ''}
                    onChange={(e) => {
                      handleInputChange('accidentCategory', e.target.value);
                    }}
                    options={accidentCategories}
                    placeholder="Select Category"
                    error={fieldErrors.accidentCategory}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Date & Time Occurred <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTimeOccurred || ''}
                    onChange={(e) => handleInputChange('dateTimeOccurred', e.target.value)}
                    className={`form-input ${fieldErrors.dateTimeOccurred ? 'error' : ''}`}
                  />
                  {fieldErrors.dateTimeOccurred && (
                    <div className={styles.fieldError}>{fieldErrors.dateTimeOccurred}</div>
                  )}
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Reported By <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reportedBy || ''}
                    onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                    placeholder="Name of person who reported"
                    className={`form-input ${fieldErrors.reportedBy ? 'error' : ''}`}
                  />
                  {fieldErrors.reportedBy && (
                    <div className={styles.fieldError}>{fieldErrors.reportedBy}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <FaMapMarkerAlt className="mr-2" />
                Location Information
              </h3>
              
              <div className={styles.formRow}>
                <div className={styles.formFieldFull}>
                  <label className={styles.fieldLabel}>
                    Site/Location <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.locationSite || ''}
                    onChange={(e) => handleInputChange('locationSite', e.target.value)}
                    placeholder="Main site or location"
                    className={`form-input ${fieldErrors.locationSite ? 'error' : ''}`}
                  />
                  {fieldErrors.locationSite && (
                    <div className={styles.fieldError}>{fieldErrors.locationSite}</div>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Building</label>
                  <input
                    type="text"
                    value={formData.locationBuilding || ''}
                    onChange={(e) => handleInputChange('locationBuilding', e.target.value)}
                    placeholder="Building name or number"
                    className="form-input"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Area/Floor</label>
                  <input
                    type="text"
                    value={formData.locationArea || ''}
                    onChange={(e) => handleInputChange('locationArea', e.target.value)}
                    placeholder="Area or floor"
                    className="form-input"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>GPS Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.locationGpsLatitude || ''}
                    onChange={(e) => handleInputChange('locationGpsLatitude', e.target.value)}
                    placeholder="Latitude"
                    className="form-input"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>GPS Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.locationGpsLongitude || ''}
                    onChange={(e) => handleInputChange('locationGpsLongitude', e.target.value)}
                    placeholder="Longitude"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Severity & Impact */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <FaExclamationTriangle className="mr-2" />
                Severity & Impact
              </h3>
              
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Injury Severity <span className={styles.required}>*</span>
                  </label>
                  <Select
                    value={formData.injurySeverity || ''}
                    onChange={(e) => {
                      handleInputChange('injurySeverity', e.target.value);
                    }}
                    options={injurySeverityOptions}
                    placeholder="Select Injury Severity"
                    error={fieldErrors.injurySeverity}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Damage Severity</label>
                  <Select
                    value={formData.damageSeverity || ''}
                    onChange={(e) => {
                      handleInputChange('damageSeverity', e.target.value);
                    }}
                    options={damageSeverityOptions}
                    placeholder="Select Damage Severity Level"
                    error={fieldErrors.damageSeverity}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Status</label>
                  <Select
                    value={formData.status || ''}
                    onChange={(e) => {
                      handleInputChange('status', e.target.value);
                    }}
                    options={statusOptions}
                    placeholder="Select Status"
                    error={fieldErrors.status}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    <input
                      type="checkbox"
                      checked={formData.regulatoryReportRequired || false}
                      onChange={(e) => handleInputChange('regulatoryReportRequired', e.target.checked)}
                      className="mr-2"
                    />
                    Regulatory Report Required
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <FaCog className="mr-2" />
                Incident Details
              </h3>
              
              <div className={styles.formFieldFull}>
                <label className={styles.fieldLabel}>
                  Description <span className={styles.required}>*</span>
                </label>
                <TextArea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the incident"
                  rows={4}
                  error={fieldErrors.description}
                />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.fieldLabel}>Investigation Notes</label>
                <TextArea
                  value={formData.investigationNotes || ''}
                  onChange={(e) => handleInputChange('investigationNotes', e.target.value)}
                  placeholder="Investigation findings and notes"
                  rows={3}
                />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.fieldLabel}>Corrective Actions</label>
                <TextArea
                  value={formData.correctiveActions || ''}
                  onChange={(e) => handleInputChange('correctiveActions', e.target.value)}
                  placeholder="Actions taken to address the incident"
                  rows={3}
                />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.fieldLabel}>Preventive Measures</label>
                <TextArea
                  value={formData.preventiveMeasures || ''}
                  onChange={(e) => handleInputChange('preventiveMeasures', e.target.value)}
                  placeholder="Measures to prevent similar incidents"
                  rows={3}
                />
              </div>
            </div>

            {/* Root Causes */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <FaExclamationTriangle className="mr-2" />
                Root Causes
              </h3>
              
              <div className={styles.rootCausesSection}>
                {(formData.rootCauses || []).map((cause, index) => (
                  <div key={index} className={styles.rootCauseItem}>
                    <input
                      type="text"
                      value={cause}
                      onChange={(e) => handleRootCauseChange(index, e.target.value)}
                      placeholder={`Root cause ${index + 1}`}
                      className="form-input"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeRootCause(index)}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addRootCause}
                  className={styles.addCauseButton}
                >
                  <FaPlus className="mr-2" />
                  Add Root Cause
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
            >
              <FaSave className="mr-2" />
              {incident ? 'Update Incident' : 'Create Incident'}
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default OSHForm;
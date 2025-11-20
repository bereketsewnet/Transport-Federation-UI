import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaImage, FaTimes } from 'react-icons/fa';
import { Button } from '@components/Button/Button';
import { TextArea } from '@components/TextArea/TextArea';
import { FormField } from '@components/FormField/FormField';
import { Loading } from '@components/Loading/Loading';
import {
  getAboutContent,
  updateAboutContent,
  getExecutives,
  createExecutive,
  updateExecutive,
  deleteExecutive,
  uploadExecutiveImage,
  type Executive,
} from '@api/cms-endpoints';
import { getImageUrl } from '@api/client';
import styles from './AboutEditor.module.css';

type Language = 'en' | 'am';

interface AboutContentState {
  mission: { en: string; am: string };
  vision: { en: string; am: string };
  description: { en: string; am: string };
  values: { en: string[]; am: string[] };
  history: { en: string; am: string };
  objectives: { en: string[]; am: string[] };
  structure: {
    title: { en: string; am: string };
    departments: { en: string[]; am: string[] };
  };
  stakeholders: {
    title: { en: string; am: string };
    list: { en: string[]; am: string[] };
  };
}

export const AboutEditor: React.FC = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  
  const [content, setContent] = useState<AboutContentState>({
    mission: { en: '', am: '' },
    vision: { en: '', am: '' },
    description: { en: '', am: '' },
    values: { en: [], am: [] },
    history: { en: '', am: '' },
    objectives: { en: [], am: [] },
    structure: { title: { en: '', am: '' }, departments: { en: [], am: [] } },
    stakeholders: { title: { en: '', am: '' }, list: { en: [], am: [] } },
  });

  const [executives, setExecutives] = useState<Executive[]>([]);
  const [experts, setExperts] = useState<Executive[]>([]);

  // Load content on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const [aboutResponse, executivesResponse, expertsResponse] = await Promise.all([
          getAboutContent(),
          getExecutives({ type: 'executive' }),
          getExecutives({ type: 'expert' }),
        ]);

        const about = aboutResponse.data.data;

        
        // Helper to normalize image path
        // Backend might return: uploads/executive-123.png or executive-123.png
        // Should be: /uploads/cms/executives/executive-123.png
        const normalizeImagePath = (path: string | null | undefined): string | null => {
          if (!path) return null;
          
          // Convert backslashes to forward slashes
          let normalized = path.replace(/\\/g, '/');
          
          // Remove leading slash temporarily to process
          normalized = normalized.replace(/^\/+/, '');
          
          // Check if path needs directory structure added
          if (normalized.startsWith('executive-') || normalized.startsWith('expert-')) {
            // Just filename: executive-123.png -> uploads/cms/executives/executive-123.png
            normalized = `uploads/cms/executives/${normalized}`;
          } else if (normalized.startsWith('uploads/executive-') || normalized.startsWith('uploads/expert-')) {
            // Missing cms/executives: uploads/executive-123.png -> uploads/cms/executives/executive-123.png
            normalized = normalized.replace('uploads/', 'uploads/cms/executives/');
          } else if (!normalized.includes('cms/executives') && (normalized.includes('executive-') || normalized.includes('expert-'))) {
            // Has uploads but missing cms/executives
            if (normalized.startsWith('uploads/')) {
              normalized = normalized.replace('uploads/', 'uploads/cms/executives/');
            }
          }
          
          // Add leading slash
          return '/' + normalized;
        };
        
        // Helper function to parse JSON arrays (in case they come as strings)
        const parseArray = (value: any): string[] => {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        setContent({
          mission: { en: about.missionEn || '', am: about.missionAm || '' },
          vision: { en: about.visionEn || '', am: about.visionAm || '' },
          description: { en: about.descriptionEn || '', am: about.descriptionAm || '' },
          values: { 
            en: parseArray(about.valuesEn), 
            am: parseArray(about.valuesAm) 
          },
          history: { en: about.historyEn || '', am: about.historyAm || '' },
          objectives: { 
            en: parseArray(about.objectivesEn), 
            am: parseArray(about.objectivesAm) 
          },
          structure: {
            title: { 
              en: about.structureTitleEn || '', 
              am: about.structureTitleAm || '' 
            },
            departments: { 
              en: parseArray(about.structureDepartmentsEn), 
              am: parseArray(about.structureDepartmentsAm) 
            },
          },
          stakeholders: {
            title: { 
              en: about.stakeholdersTitleEn || '', 
              am: about.stakeholdersTitleAm || '' 
            },
            list: { 
              en: parseArray(about.stakeholdersListEn), 
              am: parseArray(about.stakeholdersListAm) 
            },
          },
        });

        // Map executives and experts with full image URLs
        const executivesData = (executivesResponse.data.data || []).map((exec: any) => {
          const imagePath = exec.image || exec.photoUrl;
          const normalizedPath = normalizeImagePath(imagePath);
          return {
            ...exec,
            image: normalizedPath ? getImageUrl(normalizedPath) : null
          };
        });
        
        const expertsData = (expertsResponse.data.data || []).map((expert: any) => {
          const imagePath = expert.image || expert.photoUrl;
          const normalizedPath = normalizeImagePath(imagePath);
          return {
            ...expert,
            image: normalizedPath ? getImageUrl(normalizedPath) : null
          };
        });
        
        setExecutives(executivesData);
        setExperts(expertsData);
      } catch (error) {
        console.error('Failed to load about content:', error);
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Handle image upload for executives
  const handleImageUpload = async (
    file: File, 
    type: 'executive' | 'expert', 
    id: number
  ): Promise<void> => {
    try {
      const response = await uploadExecutiveImage(id, file);
      toast.success('Image uploaded successfully');
      
      // Normalize image path (backend might return various formats)
      let imagePath = response.data.imageUrl;
      // Convert backslashes to forward slashes
      imagePath = imagePath.replace(/\\/g, '/');
      // Remove leading slash temporarily
      imagePath = imagePath.replace(/^\/+/, '');
      
      // Fix directory structure if needed
      if (imagePath.startsWith('executive-') || imagePath.startsWith('expert-')) {
        imagePath = `uploads/cms/executives/${imagePath}`;
      } else if (imagePath.startsWith('uploads/executive-') || imagePath.startsWith('uploads/expert-')) {
        imagePath = imagePath.replace('uploads/', 'uploads/cms/executives/');
      } else if (!imagePath.includes('cms/executives') && (imagePath.includes('executive-') || imagePath.includes('expert-'))) {
        if (imagePath.startsWith('uploads/')) {
          imagePath = imagePath.replace('uploads/', 'uploads/cms/executives/');
        }
      }
      
      // Add leading slash
      imagePath = '/' + imagePath;
      
      // Convert relative URL to full URL
      const fullImageUrl = getImageUrl(imagePath);
      
      // Update local state
      if (type === 'executive') {
        setExecutives(prev => prev.map(exec => 
          exec.id === id ? { ...exec, image: fullImageUrl } : exec
        ));
      } else {
        setExperts(prev => prev.map(expert => 
          expert.id === id ? { ...expert, image: fullImageUrl } : expert
        ));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    }
  };

  // Add new executive
  const addExecutive = async () => {
    try {
      const response = await createExecutive({
        nameEn: 'New Executive',
        nameAm: 'አዲስ አስፈፃሚ',
        positionEn: 'Position',
        positionAm: 'የስራ ቦታ',
        type: 'executive',
        displayOrder: executives.length,
      });
      setExecutives(prev => [...prev, response.data.data]);
      toast.success('Executive added');
    } catch (error) {
      console.error('Failed to add executive:', error);
      toast.error('Failed to add executive');
    }
  };

  // Remove executive
  const removeExecutive = async (id: number) => {
    try {
      await deleteExecutive(id);
      setExecutives(prev => prev.filter(exec => exec.id !== id));
      toast.success('Executive deleted');
    } catch (error) {
      console.error('Failed to delete executive:', error);
      toast.error('Failed to delete executive');
    }
  };

  // Add new expert
  const addExpert = async () => {
    try {
      const response = await createExecutive({
        nameEn: 'New Expert',
        nameAm: 'አዲስ ባለሙያ',
        positionEn: 'Position',
        positionAm: 'የስራ ቦታ',
        type: 'expert',
        displayOrder: experts.length,
      });
      setExperts(prev => [...prev, response.data.data]);
      toast.success('Expert added');
    } catch (error) {
      console.error('Failed to add expert:', error);
      toast.error('Failed to add expert');
    }
  };

  // Remove expert
  const removeExpert = async (id: number) => {
    try {
      await deleteExecutive(id);
      setExperts(prev => prev.filter(expert => expert.id !== id));
      toast.success('Expert deleted');
    } catch (error) {
      console.error('Failed to delete expert:', error);
      toast.error('Failed to delete expert');
    }
  };

  // Update executive/expert field
  const updatePerson = async (
    type: 'executive' | 'expert',
    id: number,
    field: 'name' | 'position' | 'bio',
    lang: Language,
    value: string
  ) => {
    const array = type === 'executive' ? executives : experts;
    const person = array.find(item => item.id === id);
    if (!person) return;

    try {
      const updateData: any = {};
      
      if (field === 'name') {
        updateData.nameEn = lang === 'en' ? value : person.nameEn;
        updateData.nameAm = lang === 'am' ? value : person.nameAm;
      } else if (field === 'position') {
        updateData.positionEn = lang === 'en' ? value : person.positionEn;
        updateData.positionAm = lang === 'am' ? value : person.positionAm;
      } else if (field === 'bio') {
        updateData.bioEn = lang === 'en' ? value : (person.bioEn || '');
        updateData.bioAm = lang === 'am' ? value : (person.bioAm || '');
      }

      const response = await updateExecutive(id, updateData);
      
      // Update local state
      if (type === 'executive') {
        setExecutives(prev => prev.map(exec => 
          exec.id === id ? response.data.data : exec
        ));
      } else {
        setExperts(prev => prev.map(expert => 
          expert.id === id ? response.data.data : expert
        ));
      }
    } catch (error) {
      console.error('Failed to update person:', error);
      toast.error('Failed to update');
    }
  };

  const onSubmit = async () => {
    try {
      await updateAboutContent({
        missionEn: content.mission.en,
        missionAm: content.mission.am,
        visionEn: content.vision.en,
        visionAm: content.vision.am,
        descriptionEn: content.description.en,
        descriptionAm: content.description.am,
        valuesEn: content.values.en,
        valuesAm: content.values.am,
        historyEn: content.history.en,
        historyAm: content.history.am,
        objectivesEn: content.objectives.en,
        objectivesAm: content.objectives.am,
        structureTitleEn: content.structure.title.en,
        structureTitleAm: content.structure.title.am,
        structureDepartmentsEn: content.structure.departments.en,
        structureDepartmentsAm: content.structure.departments.am,
        stakeholdersTitleEn: content.stakeholders.title.en,
        stakeholdersTitleAm: content.stakeholders.title.am,
        stakeholdersListEn: content.stakeholders.list.en,
        stakeholdersListAm: content.stakeholders.list.am,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('About page updated successfully!');
    } catch (error) {
      console.error('Failed to update about content:', error);
      toast.error('Failed to update about content');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('about.title')} Content Editor</h1>
            <p className={styles.subtitle}>Edit About Us page content in both languages</p>
          </div>
          {saved && (
            <motion.div 
              className={styles.savedBadge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ✓ {t('messages.updateSuccess')}
            </motion.div>
          )}
        </div>

        {/* Language Tabs */}
        <div className={styles.langTabs}>
          <button
            type="button"
            className={`${styles.langTab} ${currentLang === 'en' ? styles.active : ''}`}
            onClick={() => setCurrentLang('en')}
          >
            English
          </button>
          <button
            type="button"
            className={`${styles.langTab} ${currentLang === 'am' ? styles.active : ''}`}
            onClick={() => setCurrentLang('am')}
          >
            አማርኛ (Amharic)
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className={styles.form}>
          {/* Mission */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.mission')}</h3>
            <TextArea
              value={content.mission[currentLang]}
              onChange={(e) => setContent(prev => ({
                ...prev,
                mission: { ...prev.mission, [currentLang]: e.target.value }
              }))}
              rows={4}
              placeholder={`Enter mission statement in ${currentLang === 'en' ? 'English' : 'Amharic'}...`}
            />
          </div>

          {/* Vision */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.vision')}</h3>
            <TextArea
              value={content.vision[currentLang]}
              onChange={(e) => setContent(prev => ({
                ...prev,
                vision: { ...prev.vision, [currentLang]: e.target.value }
              }))}
              rows={4}
              placeholder={`Enter vision statement in ${currentLang === 'en' ? 'English' : 'Amharic'}...`}
            />
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>About Us Description</h3>
            <TextArea
              value={content.description[currentLang]}
              onChange={(e) => setContent(prev => ({
                ...prev,
                description: { ...prev.description, [currentLang]: e.target.value }
              }))}
              rows={6}
              placeholder={`Enter about us description in ${currentLang === 'en' ? 'English' : 'Amharic'}...`}
            />
          </div>

          {/* Values */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.values')}</h3>
            {content.values[currentLang].map((value, index) => (
              <div key={index} className={styles.listItem}>
                <FormField
                  value={value}
                  onChange={(e) => {
                    const updated = [...content.values[currentLang]];
                    updated[index] = e.target.value;
                    setContent(prev => ({
                      ...prev,
                      values: { ...prev.values, [currentLang]: updated }
                    }));
                  }}
                  placeholder={`Value ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = content.values[currentLang].filter((_, i) => i !== index);
                    setContent(prev => ({
                      ...prev,
                      values: { ...prev.values, [currentLang]: updated }
                    }));
                  }}
                  className={styles.removeBtn}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setContent(prev => ({
                  ...prev,
                  values: {
                    ...prev.values,
                    [currentLang]: [...prev.values[currentLang], '']
                  }
                }));
              }}
              className={styles.addBtn}
            >
              <FaPlus /> Add Value
            </button>
          </div>

          {/* History */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.history')}</h3>
            <TextArea
              value={content.history[currentLang]}
              onChange={(e) => setContent(prev => ({
                ...prev,
                history: { ...prev.history, [currentLang]: e.target.value }
              }))}
              rows={6}
              placeholder={`Enter history in ${currentLang === 'en' ? 'English' : 'Amharic'}...`}
            />
          </div>

          {/* Objectives */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.objectives')}</h3>
            {content.objectives[currentLang].map((objective, index) => (
              <div key={index} className={styles.listItem}>
                <TextArea
                  value={objective}
                  onChange={(e) => {
                    const updated = [...content.objectives[currentLang]];
                    updated[index] = e.target.value;
                    setContent(prev => ({
                      ...prev,
                      objectives: { ...prev.objectives, [currentLang]: updated }
                    }));
                  }}
                  rows={2}
                  placeholder={`Objective ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = content.objectives[currentLang].filter((_, i) => i !== index);
                    setContent(prev => ({
                      ...prev,
                      objectives: { ...prev.objectives, [currentLang]: updated }
                    }));
                  }}
                  className={styles.removeBtn}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setContent(prev => ({
                  ...prev,
                  objectives: {
                    ...prev.objectives,
                    [currentLang]: [...prev.objectives[currentLang], '']
                  }
                }));
              }}
              className={styles.addBtn}
            >
              <FaPlus /> Add Objective
            </button>
          </div>

          {/* Structure */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.structure')}</h3>
            <FormField
              value={content.structure.title[currentLang]}
              onChange={(e) => setContent(prev => ({
                ...prev,
                structure: {
                  ...prev.structure,
                  title: { ...prev.structure.title, [currentLang]: e.target.value }
                }
              }))}
              placeholder="Structure Title"
            />
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              {content.structure.departments[currentLang].map((dept, index) => (
                <div key={index} className={styles.listItem}>
                  <FormField
                    value={dept}
                    onChange={(e) => {
                      const updated = [...content.structure.departments[currentLang]];
                      updated[index] = e.target.value;
                      setContent(prev => ({
                        ...prev,
                        structure: {
                          ...prev.structure,
                          departments: { ...prev.structure.departments, [currentLang]: updated }
                        }
                      }));
                    }}
                    placeholder={`Department ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = content.structure.departments[currentLang].filter((_, i) => i !== index);
                      setContent(prev => ({
                        ...prev,
                        structure: {
                          ...prev.structure,
                          departments: { ...prev.structure.departments, [currentLang]: updated }
                        }
                      }));
                    }}
                    className={styles.removeBtn}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setContent(prev => ({
                    ...prev,
                    structure: {
                      ...prev.structure,
                      departments: {
                        ...prev.structure.departments,
                        [currentLang]: [...prev.structure.departments[currentLang], '']
                      }
                    }
                  }));
                }}
                className={styles.addBtn}
              >
                <FaPlus /> Add Department
              </button>
            </div>
          </div>

          {/* Executives */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.executives')}</h3>
            <div className={styles.execList}>
              {executives.map((exec, index) => (
                <div key={exec.id} className={styles.execCard}>
                  <div className={styles.execHeader}>
                    <h4>Executive {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeExecutive(exec.id)}
                      className={styles.removeBtn}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  {/* Image Upload */}
                  <div className={styles.imageUpload}>
                    {exec.image ? (
                      <div className={styles.imagePreview}>
                        <img src={exec.image} alt="Preview" />
                        <button
                          type="button"
                          onClick={() => uploadExecutiveImage(exec.id, new File([], ''))}
                          className={styles.removeImageBtn}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <label className={styles.uploadLabel}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, 'executive', exec.id);
                            }
                          }}
                          className={styles.uploadInput}
                        />
                        <FaImage />
                        <span>Upload Photo</span>
                      </label>
                    )}
                  </div>

                  <FormField
                    value={currentLang === 'en' ? exec.nameEn : exec.nameAm}
                    onChange={(e) => updatePerson('executive', exec.id, 'name', currentLang, e.target.value)}
                    placeholder={`Name (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
                  <FormField
                    value={currentLang === 'en' ? exec.positionEn : exec.positionAm}
                    onChange={(e) => updatePerson('executive', exec.id, 'position', currentLang, e.target.value)}
                    placeholder={`Position (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
                  <TextArea
                    value={(currentLang === 'en' ? exec.bioEn : exec.bioAm) || ''}
                    onChange={(e) => updatePerson('executive', exec.id, 'bio', currentLang, e.target.value)}
                    rows={2}
                    placeholder={`Bio (${currentLang === 'en' ? 'English' : 'Amharic'}) - Optional`}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addExecutive}
              className={styles.addBtn}
            >
              <FaPlus /> Add Executive
            </button>
          </div>

          {/* Other Experts (for carousel) */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.otherExperts')}</h3>
            <p className={styles.sectionDesc}>These will be displayed in a carousel on the About page</p>
            <div className={styles.execList}>
              {experts.map((expert, index) => (
                <div key={expert.id} className={styles.execCard}>
                  <div className={styles.execHeader}>
                    <h4>Expert {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeExpert(expert.id)}
                      className={styles.removeBtn}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Image Upload */}
                  <div className={styles.imageUpload}>
                    {expert.image ? (
                      <div className={styles.imagePreview}>
                        <img src={expert.image} alt="Preview" />
                        <button
                          type="button"
                          onClick={() => uploadExecutiveImage(expert.id, new File([], ''))}
                          className={styles.removeImageBtn}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <label className={styles.uploadLabel}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, 'expert', expert.id);
                            }
                          }}
                          className={styles.uploadInput}
                        />
                        <FaImage />
                        <span>Upload Photo</span>
                      </label>
                    )}
                  </div>

                  <FormField
                    value={currentLang === 'en' ? expert.nameEn : expert.nameAm}
                    onChange={(e) => updatePerson('expert', expert.id, 'name', currentLang, e.target.value)}
                    placeholder={`Name (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
                  <FormField
                    value={currentLang === 'en' ? expert.positionEn : expert.positionAm}
                    onChange={(e) => updatePerson('expert', expert.id, 'position', currentLang, e.target.value)}
                    placeholder={`Position (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
            <TextArea
                    value={(currentLang === 'en' ? expert.bioEn : expert.bioAm) || ''}
                    onChange={(e) => updatePerson('expert', expert.id, 'bio', currentLang, e.target.value)}
                    rows={2}
                    placeholder={`Bio (${currentLang === 'en' ? 'English' : 'Amharic'}) - Optional`}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addExpert}
              className={styles.addBtn}
            >
              <FaPlus /> Add Expert
            </button>
          </div>

          {/* Stakeholders */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('about.stakeholders')}</h3>
            <FormField
              value={content.stakeholders.title[currentLang]}
              onChange={(e) => setContent(prev => ({
                ...prev,
                stakeholders: {
                  ...prev.stakeholders,
                  title: { ...prev.stakeholders.title, [currentLang]: e.target.value }
                }
              }))}
              placeholder="Stakeholders Title"
            />
            <div style={{ marginTop: 'var(--spacing-4)' }}>
              {content.stakeholders.list[currentLang].map((stakeholder, index) => (
                <div key={index} className={styles.listItem}>
                  <FormField
                    value={stakeholder}
                    onChange={(e) => {
                      const updated = [...content.stakeholders.list[currentLang]];
                      updated[index] = e.target.value;
                      setContent(prev => ({
                        ...prev,
                        stakeholders: {
                          ...prev.stakeholders,
                          list: { ...prev.stakeholders.list, [currentLang]: updated }
                        }
                      }));
                    }}
                    placeholder={`Stakeholder ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = content.stakeholders.list[currentLang].filter((_, i) => i !== index);
                      setContent(prev => ({
                        ...prev,
                        stakeholders: {
                          ...prev.stakeholders,
                          list: { ...prev.stakeholders.list, [currentLang]: updated }
                        }
                      }));
                    }}
                    className={styles.removeBtn}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setContent(prev => ({
                    ...prev,
                    stakeholders: {
                      ...prev.stakeholders,
                      list: {
                        ...prev.stakeholders.list,
                        [currentLang]: [...prev.stakeholders.list[currentLang], '']
                      }
                    }
                  }));
                }}
                className={styles.addBtn}
              >
                <FaPlus /> Add Stakeholder
              </button>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="submit" size="lg">
              {t('common.save')} Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AboutEditor;

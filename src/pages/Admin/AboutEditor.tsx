import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash, FaImage, FaTimes } from 'react-icons/fa';
import { defaultAboutContent, loadContentFromStorage, saveContentToStorage, AboutContent, Executive } from '@config/content';
import { Button } from '@components/Button/Button';
import { TextArea } from '@components/TextArea/TextArea';
import { FormField } from '@components/FormField/FormField';
import styles from './AboutEditor.module.css';

type Language = 'en' | 'am';

export const AboutEditor: React.FC = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [saved, setSaved] = useState(false);
  
  // Initialize content with proper validation
  const initializeContent = (): AboutContent => {
    try {
      const loadedContent = loadContentFromStorage('about', defaultAboutContent);
      
      return {
        mission: loadedContent.mission || defaultAboutContent.mission,
        vision: loadedContent.vision || defaultAboutContent.vision,
        values: {
          en: Array.isArray(loadedContent.values?.en) ? loadedContent.values.en : defaultAboutContent.values.en,
          am: Array.isArray(loadedContent.values?.am) ? loadedContent.values.am : defaultAboutContent.values.am,
        },
        history: loadedContent.history || defaultAboutContent.history,
        objectives: {
          en: Array.isArray(loadedContent.objectives?.en) ? loadedContent.objectives.en : defaultAboutContent.objectives.en,
          am: Array.isArray(loadedContent.objectives?.am) ? loadedContent.objectives.am : defaultAboutContent.objectives.am,
        },
        structure: {
          title: loadedContent.structure?.title || defaultAboutContent.structure.title,
          departments: {
            en: Array.isArray(loadedContent.structure?.departments?.en) ? loadedContent.structure.departments.en : defaultAboutContent.structure.departments.en,
            am: Array.isArray(loadedContent.structure?.departments?.am) ? loadedContent.structure.departments.am : defaultAboutContent.structure.departments.am,
          }
        },
        stakeholders: {
          title: loadedContent.stakeholders?.title || defaultAboutContent.stakeholders.title,
          list: {
            en: Array.isArray(loadedContent.stakeholders?.list?.en) ? loadedContent.stakeholders.list.en : defaultAboutContent.stakeholders.list.en,
            am: Array.isArray(loadedContent.stakeholders?.list?.am) ? loadedContent.stakeholders.list.am : defaultAboutContent.stakeholders.list.am,
          }
        },
        executives: Array.isArray(loadedContent.executives) ? loadedContent.executives : defaultAboutContent.executives,
        otherExperts: Array.isArray(loadedContent.otherExperts) ? loadedContent.otherExperts : [],
      };
    } catch (error) {
      console.error('Error loading about content, using defaults:', error);
      localStorage.removeItem('tcwf_content_about');
      return defaultAboutContent;
    }
  };
  
  const [content, setContent] = useState<AboutContent>(initializeContent());
  
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: content,
  });

  // Handle image upload for executives
  const handleImageUpload = async (
    file: File, 
    type: 'executive' | 'expert', 
    id: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setContent(prev => {
            const array = type === 'executive' ? prev.executives : prev.otherExperts;
            const index = array.findIndex(item => item.id === id);
            if (index !== -1) {
              const updated = [...array];
              updated[index] = { ...updated[index], image: e.target!.result as string };
              return {
                ...prev,
                [type === 'executive' ? 'executives' : 'otherExperts']: updated
              };
            }
            return prev;
          });
          resolve();
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (type: 'executive' | 'expert', id: string) => {
    setContent(prev => {
      const array = type === 'executive' ? prev.executives : prev.otherExperts;
      const index = array.findIndex(item => item.id === id);
      if (index !== -1) {
        const updated = [...array];
        updated[index] = { ...updated[index], image: undefined };
        return {
          ...prev,
          [type === 'executive' ? 'executives' : 'otherExperts']: updated
        };
      }
      return prev;
    });
  };

  // Add new executive
  const addExecutive = () => {
    const newExec: Executive = {
      id: `exec-${Date.now()}`,
      name: { en: '', am: '' },
      position: { en: '', am: '' },
    };
    setContent(prev => ({
      ...prev,
      executives: [...prev.executives, newExec]
    }));
  };

  // Remove executive
  const removeExecutive = (id: string) => {
    setContent(prev => ({
      ...prev,
      executives: prev.executives.filter(exec => exec.id !== id)
    }));
  };

  // Add new expert
  const addExpert = () => {
    const newExpert: Executive = {
      id: `expert-${Date.now()}`,
      name: { en: '', am: '' },
      position: { en: '', am: '' },
    };
    setContent(prev => ({
      ...prev,
      otherExperts: [...prev.otherExperts, newExpert]
    }));
  };

  // Remove expert
  const removeExpert = (id: string) => {
    setContent(prev => ({
      ...prev,
      otherExperts: prev.otherExperts.filter(expert => expert.id !== id)
    }));
  };

  // Update executive/expert field
  const updatePerson = (
    type: 'executive' | 'expert',
    id: string,
    field: 'name' | 'position' | 'bio',
    lang: Language,
    value: string
  ) => {
    setContent(prev => {
      const array = type === 'executive' ? prev.executives : prev.otherExperts;
      const index = array.findIndex(item => item.id === id);
      if (index !== -1) {
        const updated = [...array];
        if (field === 'bio') {
          updated[index] = {
            ...updated[index],
            bio: {
              en: lang === 'en' ? value : (updated[index].bio?.en || ''),
              am: lang === 'am' ? value : (updated[index].bio?.am || '')
            }
          };
        } else {
          updated[index] = {
            ...updated[index],
            [field]: { ...updated[index][field], [lang]: value }
          };
        }
        return {
          ...prev,
          [type === 'executive' ? 'executives' : 'otherExperts']: updated
        };
      }
      return prev;
    });
  };

  const onSubmit = () => {
    saveContentToStorage('about', content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
              {content.executives.map((exec) => (
                <div key={exec.id} className={styles.execCard}>
                  <div className={styles.execHeader}>
                    <h4>Executive {content.executives.indexOf(exec) + 1}</h4>
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
                          onClick={() => removeImage('executive', exec.id)}
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
                    value={exec.name[currentLang]}
                    onChange={(e) => updatePerson('executive', exec.id, 'name', currentLang, e.target.value)}
                    placeholder={`Name (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
                  <FormField
                    value={exec.position[currentLang]}
                    onChange={(e) => updatePerson('executive', exec.id, 'position', currentLang, e.target.value)}
                    placeholder={`Position (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
                  <TextArea
                    value={exec.bio?.[currentLang] || ''}
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
              {content.otherExperts.map((expert) => (
                <div key={expert.id} className={styles.execCard}>
                  <div className={styles.execHeader}>
                    <h4>Expert {content.otherExperts.indexOf(expert) + 1}</h4>
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
                          onClick={() => removeImage('expert', expert.id)}
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
                    value={expert.name[currentLang]}
                    onChange={(e) => updatePerson('expert', expert.id, 'name', currentLang, e.target.value)}
                    placeholder={`Name (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
                  <FormField
                    value={expert.position[currentLang]}
                    onChange={(e) => updatePerson('expert', expert.id, 'position', currentLang, e.target.value)}
                    placeholder={`Position (${currentLang === 'en' ? 'English' : 'Amharic'})`}
                  />
            <TextArea
                    value={expert.bio?.[currentLang] || ''}
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

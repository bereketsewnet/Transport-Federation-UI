import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';
import styles from './KPICard.module.css';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  isLoading = false,
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      className={cn(styles.card, styles[variant])}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>

      {isLoading ? (
        <div className={styles.skeleton}>
          <div className={styles.skeletonValue} />
          <div className={styles.skeletonChange} />
        </div>
      ) : (
        <>
          <motion.div
            className={styles.value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {value}
          </motion.div>

          {change !== undefined && (
            <div className={cn(styles.change, isPositive ? styles.positive : styles.negative)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={styles.changeIcon}
              >
                <path
                  d={isPositive ? 'M8 4L12 8L4 8L8 4Z' : 'M8 12L4 8L12 8L8 12Z'}
                  fill="currentColor"
                />
              </svg>
              <span>
                {Math.abs(change)}% {changeLabel}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default KPICard;


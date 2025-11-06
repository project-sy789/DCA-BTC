import { useState, useEffect } from 'react';
import './BackupReminder.css';

/**
 * BackupReminder component - Remind users to backup their data
 */
function BackupReminder() {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // Check if user should be reminded
    const lastBackup = localStorage.getItem('lastBackupDate');
    const dismissedUntil = localStorage.getItem('backupReminderDismissed');

    if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
      return; // User dismissed the reminder
    }

    if (!lastBackup) {
      // First time user - show reminder after 1 day
      const firstVisit = localStorage.getItem('firstVisitDate');
      if (!firstVisit) {
        localStorage.setItem('firstVisitDate', new Date().toISOString());
        return;
      }

      const daysSinceFirstVisit = Math.floor(
        (new Date() - new Date(firstVisit)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceFirstVisit >= 1) {
        setShowReminder(true);
      }
    } else {
      // Check if it's been more than 7 days since last backup
      const daysSinceBackup = Math.floor(
        (new Date() - new Date(lastBackup)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceBackup >= 7) {
        setShowReminder(true);
      }
    }
  }, []);

  const handleDismiss = (days) => {
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + days);
    localStorage.setItem('backupReminderDismissed', dismissUntil.toISOString());
    setShowReminder(false);
  };

  const handleBackupNow = () => {
    localStorage.setItem('lastBackupDate', new Date().toISOString());
    setShowReminder(false);
    // Trigger backup button click
    document.querySelector('.backup-button')?.click();
  };

  if (!showReminder) return null;

  return (
    <div className="backup-reminder">
      <div className="reminder-content">
        <div className="reminder-icon">💾</div>
        <div className="reminder-text">
          <strong>อย่าลืมสำรองข้อมูล!</strong>
          <p>ข้อมูลของคุณเก็บใน LocalStorage อาจหายได้ แนะนำให้สำรองข้อมูลเป็นประจำ</p>
        </div>
        <div className="reminder-actions">
          <button className="btn-backup-now" onClick={handleBackupNow}>
            สำรองเดี๋ยวนี้
          </button>
          <button className="btn-remind-later" onClick={() => handleDismiss(3)}>
            เตือนอีกครั้งใน 3 วัน
          </button>
          <button className="btn-dismiss" onClick={() => handleDismiss(30)}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackupReminder;

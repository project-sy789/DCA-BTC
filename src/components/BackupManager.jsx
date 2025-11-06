import { useState } from 'react';
import PropTypes from 'prop-types';
import LocalStorageService from '../services/LocalStorageService';
import './BackupManager.css';

/**
 * BackupManager component - Manage data backup and restore
 */
function BackupManager({ purchases, currentBTCPrice, onRestore }) {
  const [showModal, setShowModal] = useState(false);

  /**
   * Export data to JSON file
   */
  const handleExport = () => {
    const data = {
      purchases,
      currentBTCPrice,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dca-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Save backup date
    localStorage.setItem('lastBackupDate', new Date().toISOString());
  };

  /**
   * Import data from JSON file
   */
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.purchases || !Array.isArray(data.purchases)) {
          alert('ไฟล์ไม่ถูกต้อง');
          return;
        }

        // Restore data
        onRestore(data.purchases, data.currentBTCPrice || 0);
        alert('นำเข้าข้อมูลสำเร็จ!');
        setShowModal(false);
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Auto-download backup
   */
  const handleAutoBackup = () => {
    handleExport();
    // Set reminder for next backup
    const nextBackup = new Date();
    nextBackup.setDate(nextBackup.getDate() + 7);
    localStorage.setItem('nextBackupDate', nextBackup.toISOString());
  };

  return (
    <>
      <button 
        className="backup-button"
        onClick={() => setShowModal(true)}
        title="สำรองข้อมูล"
      >
        💾 สำรองข้อมูล
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>จัดการข้อมูล</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="backup-section">
                <h3>📤 ส่งออกข้อมูล (Export)</h3>
                <p>ดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ JSON</p>
                <button className="btn btn-primary" onClick={handleExport}>
                  ดาวน์โหลดข้อมูล
                </button>
              </div>

              <div className="backup-section">
                <h3>📥 นำเข้าข้อมูล (Import)</h3>
                <p>นำเข้าข้อมูลจากไฟล์ JSON ที่สำรองไว้</p>
                <div className="warning-box">
                  ⚠️ การนำเข้าจะแทนที่ข้อมูลปัจจุบันทั้งหมด
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                  id="import-file"
                />
                <label htmlFor="import-file" className="btn btn-secondary">
                  เลือกไฟล์
                </label>
              </div>

              <div className="backup-section">
                <h3>🔄 สำรองข้อมูลอัตโนมัติ</h3>
                <p>แนะนำให้สำรองข้อมูลทุกสัปดาห์</p>
                <button className="btn btn-success" onClick={handleAutoBackup}>
                  สำรองเดี๋ยวนี้
                </button>
              </div>

              <div className="info-box">
                <strong>💡 เคล็ดลับ:</strong>
                <ul>
                  <li>สำรองข้อมูลเป็นประจำเพื่อป้องกันข้อมูลหาย</li>
                  <li>เก็บไฟล์สำรองไว้ใน Google Drive หรือ Dropbox</li>
                  <li>ข้อมูลใน LocalStorage อาจหายเมื่อล้างข้อมูลเบราว์เซอร์</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

BackupManager.propTypes = {
  purchases: PropTypes.array.isRequired,
  currentBTCPrice: PropTypes.number.isRequired,
  onRestore: PropTypes.func.isRequired
};

export default BackupManager;

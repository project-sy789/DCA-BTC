import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './GoalTracker.css';

/**
 * GoalTracker component - Track BTC accumulation goals
 */
function GoalTracker({ currentBTC }) {
  const [showModal, setShowModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetBTC: '',
    deadline: ''
  });

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('btcGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('btcGoals', JSON.stringify(goals));
  }, [goals]);

  /**
   * Add new goal
   */
  const handleAddGoal = (e) => {
    e.preventDefault();
    
    if (!newGoal.name || !newGoal.targetBTC) {
      alert('กรุณากรอกชื่อเป้าหมายและจำนวน BTC');
      return;
    }

    const goal = {
      id: Date.now(),
      name: newGoal.name,
      targetBTC: parseFloat(newGoal.targetBTC),
      deadline: newGoal.deadline || null,
      createdAt: new Date().toISOString()
    };

    setGoals([...goals, goal]);
    setNewGoal({ name: '', targetBTC: '', deadline: '' });
    setShowModal(false);
  };

  /**
   * Delete goal
   */
  const handleDeleteGoal = (id) => {
    if (confirm('ต้องการลบเป้าหมายนี้?')) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  /**
   * Calculate progress percentage
   */
  const calculateProgress = (targetBTC) => {
    if (targetBTC === 0) return 0;
    const progress = (currentBTC / targetBTC) * 100;
    return Math.min(progress, 100);
  };

  /**
   * Calculate days remaining
   */
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Format BTC amount
   */
  const formatBTC = (amount) => {
    return amount.toFixed(8);
  };

  return (
    <>
      <button 
        className="goal-tracker-button"
        onClick={() => setShowModal(true)}
        title="เป้าหมายการสะสม BTC"
      >
        🎯 เป้าหมาย
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎯 เป้าหมายการสะสม BTC</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Current BTC */}
              <div className="current-btc-display">
                <div className="current-label">BTC ที่สะสมได้:</div>
                <div className="current-amount">{formatBTC(currentBTC)} BTC</div>
              </div>

              {/* Goals List */}
              {goals.length > 0 && (
                <div className="goals-list">
                  {goals.map(goal => {
                    const progress = calculateProgress(goal.targetBTC);
                    const daysRemaining = getDaysRemaining(goal.deadline);
                    const isCompleted = progress >= 100;
                    const isOverdue = daysRemaining !== null && daysRemaining < 0 && !isCompleted;

                    return (
                      <div key={goal.id} className={`goal-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
                        <div className="goal-header">
                          <div className="goal-name">{goal.name}</div>
                          <button 
                            className="delete-goal-btn"
                            onClick={() => handleDeleteGoal(goal.id)}
                            title="ลบเป้าหมาย"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="goal-target">
                          เป้าหมาย: {formatBTC(goal.targetBTC)} BTC
                        </div>

                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                          >
                            {progress >= 20 && <span className="progress-text">{progress.toFixed(1)}%</span>}
                          </div>
                        </div>

                        <div className="goal-stats">
                          <div className="stat">
                            <span className="stat-label">ความคืบหน้า:</span>
                            <span className="stat-value">{formatBTC(currentBTC)} / {formatBTC(goal.targetBTC)} BTC</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">เหลืออีก:</span>
                            <span className="stat-value">{formatBTC(Math.max(0, goal.targetBTC - currentBTC))} BTC</span>
                          </div>
                          {goal.deadline && (
                            <div className="stat">
                              <span className="stat-label">กำหนดเวลา:</span>
                              <span className={`stat-value ${isOverdue ? 'overdue-text' : ''}`}>
                                {daysRemaining !== null && daysRemaining >= 0 
                                  ? `อีก ${daysRemaining} วัน`
                                  : isOverdue 
                                    ? `เกินกำหนด ${Math.abs(daysRemaining)} วัน`
                                    : new Date(goal.deadline).toLocaleDateString('th-TH')}
                              </span>
                            </div>
                          )}
                        </div>

                        {isCompleted && (
                          <div className="goal-completed-badge">
                            ✅ บรรลุเป้าหมายแล้ว!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Goal Form */}
              <div className="add-goal-section">
                <h3>เพิ่มเป้าหมายใหม่</h3>
                <form onSubmit={handleAddGoal}>
                  <div className="form-group">
                    <label>ชื่อเป้าหมาย</label>
                    <input
                      type="text"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      placeholder="เช่น: สะสม 1 BTC"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>จำนวน BTC เป้าหมาย</label>
                    <input
                      type="number"
                      value={newGoal.targetBTC}
                      onChange={(e) => setNewGoal({...newGoal, targetBTC: e.target.value})}
                      placeholder="0.00000000"
                      step="0.00000001"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>กำหนดเวลา (ไม่บังคับ)</label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    เพิ่มเป้าหมาย
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

GoalTracker.propTypes = {
  currentBTC: PropTypes.number.isRequired
};

export default GoalTracker;

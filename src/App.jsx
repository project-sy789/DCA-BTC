import { useState, useEffect, useMemo } from 'react'
import LocalStorageService from './services/LocalStorageService'
import Dashboard from './components/Dashboard'
import InputSection from './components/InputSection'
import LogTable from './components/LogTable'
import ChartsSection from './components/ChartsSection'
import BackupManager from './components/BackupManager'
import BackupReminder from './components/BackupReminder'
import GoalTracker from './components/GoalTracker'
import DCACalculator from './components/DCACalculator'
import PriceAlert from './components/PriceAlert'
import LumpSumComparison from './components/LumpSumComparison'
import './App.css'

function App() {
  // Main state for purchases array and current BTC price
  const [purchases, setPurchases] = useState([])
  const [currentBTCPrice, setCurrentBTCPrice] = useState(0)
  const [alerts, setAlerts] = useState([])

  // Load data from LocalStorage on component mount
  useEffect(() => {
    const loadedData = LocalStorageService.loadData()
    setPurchases(loadedData.purchases)
    setCurrentBTCPrice(loadedData.currentBTCPrice)
    setAlerts(loadedData.alerts || [])
  }, [])

  // Auto-save to LocalStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      purchases,
      currentBTCPrice,
      alerts
    }
    LocalStorageService.saveData(dataToSave)
  }, [purchases, currentBTCPrice, alerts])

  /**
   * Add a new purchase record
   * @param {Object} purchase - Purchase object with date, investmentAmount, btcPrice, btcReceived
   */
  const addPurchase = (purchase) => {
    setPurchases(prevPurchases => [...prevPurchases, purchase])
  }

  /**
   * Delete a purchase record by index
   * @param {number} index - Index of the purchase to delete
   */
  const deletePurchase = (index) => {
    setPurchases(prevPurchases => prevPurchases.filter((_, i) => i !== index))
  }

  /**
   * Update a purchase record by index
   * @param {number} index - Index of the purchase to update
   * @param {Object} updatedPurchase - Updated purchase object
   */
  const updatePurchase = (index, updatedPurchase) => {
    setPurchases(prevPurchases => 
      prevPurchases.map((purchase, i) => 
        i === index ? updatedPurchase : purchase
      )
    )
  }

  /**
   * Update the current BTC price
   * @param {number} price - New BTC price
   */
  const updateCurrentPrice = (price) => {
    setCurrentBTCPrice(price)
  }

  /**
   * Restore data from backup
   * @param {Array} restoredPurchases - Restored purchases array
   * @param {number} restoredPrice - Restored current BTC price
   */
  const handleRestore = (restoredPurchases, restoredPrice) => {
    setPurchases(restoredPurchases)
    setCurrentBTCPrice(restoredPrice)
  }

  /**
   * Add a new alert
   * @param {Object} alert - Alert object
   */
  const addAlert = (alert) => {
    setAlerts(prevAlerts => [...prevAlerts, alert])
  }

  /**
   * Delete an alert by ID
   * @param {string} alertId - ID of the alert to delete
   */
  const deleteAlert = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId))
  }

  /**
   * Update an alert's triggered status
   * @param {string} alertId - ID of the alert to update
   * @param {boolean} triggered - New triggered status
   */
  const updateAlertTriggered = (alertId, triggered) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, triggered } 
          : alert
      )
    )
  }

  /**
   * Calculate total BTC accumulated
   */
  const totalBTC = useMemo(() => {
    return purchases.reduce((sum, purchase) => sum + purchase.btcReceived, 0)
  }, [purchases])

  return (
    <div className="app">
      <header>
        <h1>DCA Bitcoin Tracker</h1>
      </header>
      <main>
        <Dashboard purchases={purchases} currentBTCPrice={currentBTCPrice} />
        <InputSection 
          currentPrice={currentBTCPrice}
          onPriceChange={updateCurrentPrice}
          onAddPurchase={addPurchase}
        />
        <DCACalculator />
        <PriceAlert
          currentBTCPrice={currentBTCPrice}
          alerts={alerts}
          onAddAlert={addAlert}
          onDeleteAlert={deleteAlert}
          onUpdateAlert={updateAlertTriggered}
        />
        <LumpSumComparison 
          purchases={purchases}
          currentBTCPrice={currentBTCPrice}
        />
        <ChartsSection 
          purchases={purchases}
          currentBTCPrice={currentBTCPrice}
        />
        <LogTable 
          purchases={purchases}
          onDeletePurchase={deletePurchase}
          onUpdatePurchase={updatePurchase}
        />
      </main>
      <BackupManager 
        purchases={purchases}
        currentBTCPrice={currentBTCPrice}
        onRestore={handleRestore}
      />
      <GoalTracker currentBTC={totalBTC} />
      <BackupReminder />
    </div>
  )
}

export default App

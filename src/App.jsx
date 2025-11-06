import { useState, useEffect, useMemo } from 'react'
import LocalStorageService from './services/LocalStorageService'
import Dashboard from './components/Dashboard'
import InputSection from './components/InputSection'
import LogTable from './components/LogTable'
import ChartsSection from './components/ChartsSection'
import BackupManager from './components/BackupManager'
import BackupReminder from './components/BackupReminder'
import GoalTracker from './components/GoalTracker'
import './App.css'

function App() {
  // Main state for purchases array and current BTC price
  const [purchases, setPurchases] = useState([])
  const [currentBTCPrice, setCurrentBTCPrice] = useState(0)

  // Load data from LocalStorage on component mount
  useEffect(() => {
    const loadedData = LocalStorageService.loadData()
    setPurchases(loadedData.purchases)
    setCurrentBTCPrice(loadedData.currentBTCPrice)
  }, [])

  // Auto-save to LocalStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      purchases,
      currentBTCPrice
    }
    LocalStorageService.saveData(dataToSave)
  }, [purchases, currentBTCPrice])

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

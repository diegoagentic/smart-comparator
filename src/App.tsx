import { useState } from 'react'
import { GenUIProvider } from './context/GenUIContext'
import { useAuth } from './context/AuthContext'
import Login from "./Login"
import Transactions from "./Transactions"
import OrderDetail from "./OrderDetail"
import AckDetail from "./AckDetail"
import OCRTracking from "./OCRTracking"
import Navbar from "./components/Navbar"
import SessionExpiryModal from "./components/SessionExpiryModal"

type Page = 'transactions' | 'ocr' | 'order-detail' | 'ack-detail'

function App() {
  const { user, initialLoading, signOut, showSessionWarning, refreshSession } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('transactions')

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page)
  }

  const handleLogout = () => {
    signOut()
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'transactions':
        return (
          <Transactions
            onNavigateToDetail={(type: string) => {
              if (type === 'order-detail') setCurrentPage('order-detail')
              if (type === 'ack-detail') setCurrentPage('ack-detail')
            }}
            onNavigateToWorkspace={() => setCurrentPage('transactions')}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )
      case 'order-detail':
        return (
          <OrderDetail
            onBack={() => setCurrentPage('transactions')}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onNavigateToWorkspace={() => setCurrentPage('transactions')}
          />
        )
      case 'ack-detail':
        return (
          <AckDetail
            onBack={() => setCurrentPage('transactions')}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onNavigateToWorkspace={() => setCurrentPage('transactions')}
          />
        )
      case 'ocr':
        return (
          <OCRTracking onLogout={handleLogout} onNavigate={handleNavigate} />
        )
      default:
        return null
    }
  }

  return (
    <GenUIProvider>
      <div className="min-h-screen bg-background text-foreground">
        {currentPage !== 'order-detail' && currentPage !== 'ack-detail' && (
          <Navbar
            onLogout={handleLogout}
            activeTab={currentPage === 'transactions' ? 'Transactions' : 'OCR'}
            onNavigateToWorkspace={() => setCurrentPage('transactions')}
            onNavigate={handleNavigate}
          />
        )}
        {renderPage()}
        <SessionExpiryModal
          isOpen={showSessionWarning}
          onExtend={refreshSession}
          onLogout={handleLogout}
        />
      </div>
    </GenUIProvider>
  )
}

export default App

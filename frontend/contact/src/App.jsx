import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import { useAuth } from './context/AuthContext'

import AdminBroadcast from './pages/AdminBroadcast'
import Messages from './pages/Messages'
import AdminUsers from './pages/AdminUsers'
function App() {
  const { user } = useAuth()
  const isAuthenticated = !!user

  return (
    <Routes>
      <Route path="/auth" element={isAuthenticated ? <Navigate to={user?.role === 'ADMIN' ? '/admin/broadcast' : '/messages'} replace /> : <Auth />} />
      <Route path="/admin/broadcast" element={isAuthenticated && user?.role === 'ADMIN' ? <AdminBroadcast /> : <Navigate to="/auth" replace /> } />
      <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/auth" replace />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin/broadcast' : '/messages') : '/auth'} replace />} />
      <Route path="/admin/users" element={isAuthenticated && user?.role === 'ADMIN' ? <AdminUsers /> : <Navigate to="/auth" replace /> } />
      <Route path="*" element={<div>404</div>} />
    </Routes>
    
  )
}

export default App
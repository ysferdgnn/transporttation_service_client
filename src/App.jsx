import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material'
import './App.css'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { useAuth } from './auth/AuthContext.jsx'
import { setForbiddenHandler } from './api/client.js'

function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function App() {
  const [forbiddenOpen, setForbiddenOpen] = useState(false)

  useEffect(() => {
    setForbiddenHandler(() => setForbiddenOpen(true))
  }, [])

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Routes>
      <Snackbar
        open={forbiddenOpen}
        autoHideDuration={6000}
        onClose={() => setForbiddenOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setForbiddenOpen(false)}
          severity="warning"
          variant="filled"
        >
          Yetkiniz yok.
        </Alert>
      </Snackbar>
    </>
  )
}

export default App

import { useEffect, useState } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { apiClient } from '../api/client'
import LocationsTab from './dashboard/LocationsTab.jsx'
import TransportationsTab from './dashboard/TransportationsTab.jsx'
import RoutesTab from './dashboard/RoutesTab.jsx'
import '../App.css'

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f7',
    },
  },
})

const TAB_ITEMS = [
  { key: 'locations', label: 'Locations', adminOnly: true },
  { key: 'transportations', label: 'Transportations', adminOnly: true },
  { key: 'routes', label: 'Routes', adminOnly: false },
]

function DashboardPage() {
  const navigate = useNavigate()
  const { logout, isAdmin } = useAuth()
  const [selectedTab, setSelectedTab] = useState('routes')

  const [locations, setLocations] = useState([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [locationsError, setLocationsError] = useState('')

  const [transportations, setTransportations] = useState([])
  const [isLoadingTransportations, setIsLoadingTransportations] = useState(false)
  const [transportationsError, setTransportationsError] = useState('')

  const loadLocations = async () => {
    setIsLoadingLocations(true)
    setLocationsError('')
    try {
      const response = await apiClient.get('/locations')
      const list = Array.isArray(response?.data) ? response.data : []
      setLocations(list)
    } catch (error) {
      console.error(error)
      setLocationsError('Lokasyonlar alınamadı.')
      throw error
    } finally {
      setIsLoadingLocations(false)
    }
  }

  const loadTransportations = async () => {
    setIsLoadingTransportations(true)
    setTransportationsError('')
    try {
      const response = await apiClient.get('/transportations')
      const list = Array.isArray(response?.data) ? response.data : []
      setTransportations(list)
    } catch (error) {
      console.error(error)
      setTransportationsError('Transportation listesi alınamadı.')
      throw error
    } finally {
      setIsLoadingTransportations(false)
    }
  }

  useEffect(() => {
    loadLocations()
  }, [])

  useEffect(() => {
    const current = TAB_ITEMS.find((t) => t.key === selectedTab)
    if (current?.adminOnly && !isAdmin) {
      setSelectedTab('routes')
    }
  }, [isAdmin, selectedTab])

  const handleTabClick = async (key) => {
    if (key === 'routes') {
      setSelectedTab('routes')
      return
    }
    if (key === 'locations') {
      try {
        await loadLocations()
        setSelectedTab('locations')
      } catch {
        // 403 vb. – snackbar zaten gösterildi, sekme değişmez
      }
      return
    }
    if (key === 'transportations') {
      try {
        await loadTransportations()
        setSelectedTab('transportations')
      } catch {
        // 403 vb. – sekme değişmez
      }
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar
          position="static"
          elevation={0}
          color="default"
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              HEADER
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              color="inherit"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Paper
            elevation={0}
            square
            sx={{
              width: 220,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
            }}
          >
            <List disablePadding>
              {TAB_ITEMS.filter((t) => !t.adminOnly || isAdmin).map((tab) => (
                <ListItemButton
                  key={tab.key}
                  selected={tab.key === selectedTab}
                  onClick={() => handleTabClick(tab.key)}
                >
                  <ListItemText primary={tab.label} />
                </ListItemButton>
              ))}
            </List>
          </Paper>

          <Box
            sx={{
              flex: 1,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              overflow: 'hidden',
            }}
          >
            {selectedTab === 'locations' && (
              <LocationsTab
                locations={locations}
                isLoadingLocations={isLoadingLocations}
                locationsError={locationsError}
                loadLocations={loadLocations}
                setLocationsError={setLocationsError}
              />
            )}

            {selectedTab === 'transportations' && (
              <TransportationsTab
                locations={locations}
                transportations={transportations}
                isLoadingTransportations={isLoadingTransportations}
                transportationsError={transportationsError}
                loadTransportations={loadTransportations}
                setTransportationsError={setTransportationsError}
              />
            )}

            {selectedTab === 'routes' && (
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
                <RoutesTab locations={locations} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default DashboardPage

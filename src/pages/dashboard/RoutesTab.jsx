import { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Button,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { apiClient } from '../../api/client'

function getLocationLabel(locations, code) {
  if (!code) return ''
  const loc = locations.find((l) => l.locationCode === code)
  if (!loc) return code
  return `${loc.name} (${code})`
}

function RoutesTab({ locations }) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('2026-06-24')
  const [routes, setRoutes] = useState([])
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false)
  const [routesError, setRoutesError] = useState('')
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null)

  const selectedRoute =
    selectedRouteIndex != null && routes[selectedRouteIndex]
      ? routes[selectedRouteIndex]
      : null

  const searchRoutes = async () => {
    setRoutesError('')

    if (!origin || !destination || !date) {
      setRoutesError('Origin, destination ve date zorunludur.')
      return
    }

    setIsLoadingRoutes(true)
    setSelectedRouteIndex(null)
    try {
      const params = new URLSearchParams({
        originCode: origin,
        destinationCode: destination,
        date,
      })
      const response = await apiClient.get(`/routes?${params.toString()}`)
      const list = Array.isArray(response?.data) ? response.data : []
      setRoutes(list)
      if (list.length > 0) {
        setSelectedRouteIndex(0)
      }
    } catch (error) {
      console.error(error)
      setRoutes([])
      setRoutesError('Routes alınamadı.')
    } finally {
      setIsLoadingRoutes(false)
    }
  }

  // Sync origin/destination from locations when locations load
  const originOptions = useMemo(() => locations, [locations])
  const destinationOptions = useMemo(() => locations, [locations])

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 0 }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="origin-label">Origin</InputLabel>
            <Select
              labelId="origin-label"
              label="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              {originOptions.map((loc) => (
                <MenuItem key={loc.locationCode} value={loc.locationCode}>
                  {loc.name} ({loc.locationCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="destination-label">Destination</InputLabel>
            <Select
              labelId="destination-label"
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              {destinationOptions.map((loc) => (
                <MenuItem key={loc.locationCode} value={loc.locationCode}>
                  {loc.name} ({loc.locationCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={1}
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={searchRoutes}
            disabled={isLoadingRoutes}
          >
            {isLoadingRoutes ? 'Yükleniyor...' : 'Ara'}
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            mb: 1,
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          Available Routes
        </Typography>
        <Paper variant="outlined" sx={{ overflow: 'auto', maxHeight: '100%' }}>
          {routesError ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="error">
                {routesError}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {routes.map((route, index) => {
                const segments = route.segments ?? []
                const first = segments[0]
                const last = segments[segments.length - 1]
                const summary =
                  first && last
                    ? `${first.originCode} → ${last.destinationCode}`
                    : undefined
                const flightSegment = segments.find((s) => s.type === 'FLIGHT')
                const primaryLabel = flightSegment
                  ? `Via ${getLocationLabel(locations, flightSegment.originCode)}`
                  : `Route ${index + 1}`

                return (
                  <ListItemButton
                    key={index}
                    selected={index === selectedRouteIndex}
                    onClick={() => setSelectedRouteIndex(index)}
                    sx={{
                      '&.Mui-selected': { bgcolor: 'primary.50' },
                    }}
                  >
                    <ListItemText primary={primaryLabel} secondary={summary} />
                  </ListItemButton>
                )
              })}
              {routes.length === 0 && !isLoadingRoutes && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz route bulunamadı. Lütfen arama yapın.
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Paper>
      </Box>
      </Box>

      {selectedRoute && (
        <Paper
          square
          elevation={3}
          sx={{
            width: 320,
            borderLeft: '1px solid',
            borderColor: 'divider',
            p: 3,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Route Details
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSelectedRouteIndex(null)}
              aria-label="Close route details"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ mt: 1 }}>
            {(() => {
              const segments = selectedRoute.segments ?? []
              if (!segments.length) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    Bu route için segment bulunamadı.
                  </Typography>
                )
              }

              const stops = [segments[0].originCode]
              segments.forEach((seg) => stops.push(seg.destinationCode))

              return stops.map((code, index) => {
                const isLast = index === stops.length - 1
                const mode =
                  index < segments.length ? segments[index].type : ''
                return (
                  <Box
                    key={`${code}-${index}`}
                    sx={{ display: 'flex', alignItems: 'flex-start' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mr: 2,
                      }}
                    >
                      <RadioButtonUncheckedIcon
                        fontSize="small"
                        sx={{
                          color: isLast ? 'text.disabled' : 'primary.main',
                        }}
                      />
                      {!isLast && (
                        <Box
                          sx={{
                            flex: 1,
                            borderLeft: '1px dashed',
                            borderColor: 'divider',
                            mt: 0.5,
                            mb: 1.5,
                            minHeight: 24,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ pb: isLast ? 0 : 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          maxWidth: 220,
                        }}
                        title={getLocationLabel(locations, code)}
                      >
                        {getLocationLabel(locations, code)}
                      </Typography>
                      {mode && (
                        <Typography variant="body2" color="text.secondary">
                          {mode}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )
              })
            })()}
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{
                cursor: 'pointer',
                fontWeight: 500,
                textAlign: 'right',
              }}
              onClick={() => setSelectedRouteIndex(null)}
            >
              Close
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default RoutesTab

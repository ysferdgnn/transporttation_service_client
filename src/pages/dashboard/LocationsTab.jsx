import { useState } from 'react'
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
  CircularProgress,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { apiClient } from '../../api/client'

const LOCATION_TYPES = ['AIRPORT', 'OTHER']

function LocationsTab({
  locations,
  isLoadingLocations,
  locationsError,
  loadLocations,
  setLocationsError,
}) {
  const [newLocation, setNewLocation] = useState({
    locationCode: '',
    name: '',
    city: '',
    country: 'TR',
    type: LOCATION_TYPES[0],
  })
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deletingLocationId, setDeletingLocationId] = useState(null)

  const handleNewLocationChange = (field) => (event) => {
    setNewLocation((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleAddLocation = async (event) => {
    event.preventDefault()
    setSaveError('')

    if (
      !newLocation.locationCode.trim() ||
      !newLocation.name.trim() ||
      !newLocation.city.trim() ||
      !newLocation.country.trim() ||
      !newLocation.type
    ) {
      setSaveError('Tüm alanlar zorunludur.')
      return
    }

    setIsSavingLocation(true)
    try {
      await apiClient.post('/locations', {
        locationCode: newLocation.locationCode,
        name: newLocation.name,
        city: newLocation.city,
        country: newLocation.country,
        type: newLocation.type,
      })
      setNewLocation({
        locationCode: '',
        name: '',
        city: '',
        country: 'TR',
        type: LOCATION_TYPES[0],
      })
      await loadLocations()
    } catch (error) {
      console.error(error)
      setSaveError('Lokasyon kaydedilemedi.')
    } finally {
      setIsSavingLocation(false)
    }
  }

  const handleDeleteLocation = async (id) => {
    if (!id) return
    setDeletingLocationId(id)
    if (setLocationsError) setLocationsError('')
    try {
      await apiClient.delete(`/locations/${id}`)
      await loadLocations()
    } catch (error) {
      console.error(error)
      if (setLocationsError) setLocationsError('Location silinemedi.')
    } finally {
      setDeletingLocationId(null)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Locations
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 2 }}
        component="form"
        onSubmit={handleAddLocation}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Location Code"
              value={newLocation.locationCode}
              onChange={handleNewLocationChange('locationCode')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Name"
              value={newLocation.name}
              onChange={handleNewLocationChange('name')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="City"
              value={newLocation.city}
              onChange={handleNewLocationChange('city')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Country"
              value={newLocation.country}
              onChange={handleNewLocationChange('country')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="location-type-label">Type</InputLabel>
              <Select
                labelId="location-type-label"
                label="Type"
                value={newLocation.type}
                onChange={handleNewLocationChange('type')}
              >
                {LOCATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {saveError && (
            <Grid item xs={12}>
              <Typography variant="body2" color="error">
                {saveError}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={isSavingLocation}
            >
              {isSavingLocation ? 'Kaydediliyor...' : 'Location Ekle'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}
      >
        {isLoadingLocations ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : locationsError ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="error">
              {locationsError}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {locations.map((loc) => (
              <ListItemButton
                key={loc.id ?? loc.locationCode}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ListItemText
                  primary={`${loc.name} (${loc.locationCode})`}
                  secondary={`${loc.city ?? ''} ${loc.country ?? ''}`}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Sil"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteLocation(loc.id)
                  }}
                  disabled={deletingLocationId === loc.id}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
            {locations.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Kayıtlı location bulunmuyor.
                </Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>
    </Box>
  )
}

export default LocationsTab

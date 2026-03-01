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
  IconButton,
  Button,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { apiClient } from '../../api/client'

const TRANSPORTATION_TYPES = ['FLIGHT', 'BUS', 'SUBWAY', 'OTHER']

function TransportationsTab({
  locations,
  transportations,
  isLoadingTransportations,
  transportationsError,
  loadTransportations,
  setTransportationsError,
}) {
  const [newTransportation, setNewTransportation] = useState({
    originCode: '',
    destinationCode: '',
    type: TRANSPORTATION_TYPES[0],
    operatingDays: [],
  })
  const [isSavingTransportation, setIsSavingTransportation] = useState(false)
  const [saveTransportationError, setSaveTransportationError] = useState('')
  const [deletingTransportationId, setDeletingTransportationId] = useState(null)

  const handleNewTransportationChange = (field) => (event) => {
    const value = event.target.value
    setNewTransportation((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOperatingDaysChange = (event) => {
    const value = event.target.value
    const days = typeof value === 'string' ? value.split(',') : value
    setNewTransportation((prev) => ({
      ...prev,
      operatingDays: days.map((d) => Number(d)),
    }))
  }

  const handleAddTransportation = async (event) => {
    event.preventDefault()
    setSaveTransportationError('')

    if (
      !newTransportation.originCode ||
      !newTransportation.destinationCode ||
      !newTransportation.type ||
      !newTransportation.operatingDays.length
    ) {
      setSaveTransportationError(
        'Tüm alanlar zorunludur ve en az bir gün seçilmelidir.'
      )
      return
    }

    setIsSavingTransportation(true)
    try {
      await apiClient.post('/transportations', {
        originCode: newTransportation.originCode,
        destinationCode: newTransportation.destinationCode,
        type: newTransportation.type,
        operatingDays: newTransportation.operatingDays,
      })
      setNewTransportation({
        originCode: '',
        destinationCode: '',
        type: TRANSPORTATION_TYPES[0],
        operatingDays: [],
      })
      await loadTransportations()
    } catch (error) {
      console.error(error)
      setSaveTransportationError('Transportation kaydedilemedi.')
    } finally {
      setIsSavingTransportation(false)
    }
  }

  const handleDeleteTransportation = async (id) => {
    if (!id) return
    setDeletingTransportationId(id)
    if (setTransportationsError) setTransportationsError('')
    try {
      await apiClient.delete(`/transportations/${id}`)
      await loadTransportations()
    } catch (error) {
      console.error(error)
      if (setTransportationsError)
        setTransportationsError('Transportation silinemedi.')
    } finally {
      setDeletingTransportationId(null)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Transportations
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 2 }}
        component="form"
        onSubmit={handleAddTransportation}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="transport-origin-label">Origin</InputLabel>
              <Select
                labelId="transport-origin-label"
                label="Origin"
                value={newTransportation.originCode}
                onChange={handleNewTransportationChange('originCode')}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.locationCode} value={loc.locationCode}>
                    {loc.name} ({loc.locationCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="transport-destination-label">
                Destination
              </InputLabel>
              <Select
                labelId="transport-destination-label"
                label="Destination"
                value={newTransportation.destinationCode}
                onChange={handleNewTransportationChange('destinationCode')}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.locationCode} value={loc.locationCode}>
                    {loc.name} ({loc.locationCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="transport-type-label">Type</InputLabel>
              <Select
                labelId="transport-type-label"
                label="Type"
                value={newTransportation.type}
                onChange={handleNewTransportationChange('type')}
              >
                {TRANSPORTATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="operating-days-label">Operating Days</InputLabel>
              <Select
                labelId="operating-days-label"
                multiple
                value={newTransportation.operatingDays}
                onChange={handleOperatingDaysChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {saveTransportationError && (
            <Grid item xs={12}>
              <Typography variant="body2" color="error">
                {saveTransportationError}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={isSavingTransportation}
            >
              {isSavingTransportation
                ? 'Kaydediliyor...'
                : 'Transportation Ekle'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}
      >
        {isLoadingTransportations ? (
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
        ) : transportationsError ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="error">
              {transportationsError}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {transportations.map((t) => (
              <ListItemButton
                key={t.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ListItemText
                  primary={`${t.originCode} → ${t.destinationCode} (${t.type})`}
                  secondary={
                    t.operatingDays?.length
                      ? `Days: ${t.operatingDays.join(', ')}`
                      : undefined
                  }
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Sil"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTransportation(t.id)
                  }}
                  disabled={deletingTransportationId === t.id}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
            {transportations.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Kayıtlı transportation bulunmuyor.
                </Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>
    </Box>
  )
}

export default TransportationsTab

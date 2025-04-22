import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import { createApiClient, School, CreateSchoolDto } from '../services/api';

const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newSchool, setNewSchool] = useState<CreateSchoolDto>({
    name: '',
    address: '',
  });
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const api = token ? createApiClient(token) : null;

  useEffect(() => {
    const fetchSchools = async () => {
      if (!api) return;
      
      try {
        setLoading(true);
        const data = await api.schools.getAll();
        setSchools(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch schools');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [api]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewSchool({ name: '', address: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSchool((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSchool = async () => {
    if (!api) return;
    
    try {
      const created = await api.schools.create(newSchool);
      setSchools((prev) => [...prev, created]);
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to create school');
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/schools/${id}`);
  };

  if (loading) {
    return <Typography>Loading schools...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box className="page-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Schools
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add School
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No schools found. Add your first school!
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow
                  key={school.id}
                  hover
                  onClick={() => handleRowClick(school.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.address}</TableCell>
                  <TableCell>{school.city || 'N/A'}</TableCell>
                  <TableCell>{school.phone || 'N/A'}</TableCell>
                  <TableCell>{school.type || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New School</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="School Name"
                fullWidth
                required
                value={newSchool.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                required
                value={newSchool.address}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="city"
                label="City"
                fullWidth
                value={newSchool.city || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="state"
                label="State"
                fullWidth
                value={newSchool.state || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                value={newSchool.phone || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={newSchool.email || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="type"
                label="School Type"
                fullWidth
                placeholder="e.g., Elementary, High School"
                value={newSchool.type || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateSchool} 
            variant="contained"
            disabled={!newSchool.name || !newSchool.address}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolsPage; 
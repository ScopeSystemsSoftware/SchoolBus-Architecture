import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { createApiClient, School, Student, CreateStudentDto } from '../services/api';

const SchoolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const api = token ? createApiClient(token) : null;

  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openStudentDialog, setOpenStudentDialog] = useState<boolean>(false);
  const [editedSchool, setEditedSchool] = useState<Partial<School>>({});
  const [newStudent, setNewStudent] = useState<CreateStudentDto>({
    schoolId: id || '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!api || !id) return;
      
      try {
        setLoading(true);
        const schoolData = await api.schools.getById(id);
        setSchool(schoolData);
        
        const studentsData = await api.students.getBySchool(id);
        setStudents(studentsData);
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch school details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedSchool((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenEditDialog = () => {
    setEditedSchool(school || {});
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenStudentDialog = () => {
    setOpenStudentDialog(true);
  };

  const handleCloseStudentDialog = () => {
    setOpenStudentDialog(false);
    setNewStudent({
      schoolId: id || '',
      firstName: '',
      lastName: '',
    });
  };

  const handleUpdateSchool = async () => {
    if (!api || !id) return;
    
    try {
      const updated = await api.schools.update(id, editedSchool);
      setSchool(updated);
      handleCloseEditDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to update school');
    }
  };

  const handleDeleteSchool = async () => {
    if (!api || !id) return;
    
    try {
      await api.schools.delete(id);
      navigate('/schools');
    } catch (err: any) {
      setError(err.message || 'Failed to delete school');
      handleCloseDeleteDialog();
    }
  };

  const handleCreateStudent = async () => {
    if (!api) return;
    
    try {
      const created = await api.students.create(newStudent);
      setStudents((prev) => [...prev, created]);
      handleCloseStudentDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to create student');
    }
  };

  if (loading) {
    return <Typography>Loading school details...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!school) {
    return <Typography>School not found</Typography>;
  }

  return (
    <Box className="page-container">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/schools')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {school.name}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleOpenEditDialog}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleOpenDeleteDialog}
        >
          Delete
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Address:</Typography>
            <Typography>
              {school.address}
              {school.city && `, ${school.city}`}
              {school.state && `, ${school.state}`}
              {school.postalCode && ` ${school.postalCode}`}
              {school.country && `, ${school.country}`}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Contact:</Typography>
            <Typography>
              {school.phone && `Phone: ${school.phone}`}
              {school.email && <><br />Email: {school.email}</>}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Type:</Typography>
            <Typography>{school.type || 'Not specified'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Status:</Typography>
            <Typography>{school.active ? 'Active' : 'Inactive'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} /> Students
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenStudentDialog}
        >
          Add Student
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Guardian</TableCell>
              <TableCell>Contact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No students found. Add your first student!
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                  <TableCell>{student.grade || 'N/A'}</TableCell>
                  <TableCell>{student.guardianName || 'N/A'}</TableCell>
                  <TableCell>{student.guardianPhone || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit School Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit School</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="School Name"
                fullWidth
                required
                value={editedSchool.name || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                required
                value={editedSchool.address || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="city"
                label="City"
                fullWidth
                value={editedSchool.city || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="state"
                label="State"
                fullWidth
                value={editedSchool.state || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                value={editedSchool.phone || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={editedSchool.email || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="type"
                label="School Type"
                fullWidth
                value={editedSchool.type || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateSchool} 
            variant="contained"
            disabled={!editedSchool.name || !editedSchool.address}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete School Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete School</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {school.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteSchool} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={openStudentDialog} onClose={handleCloseStudentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                required
                value={newStudent.firstName}
                onChange={handleStudentInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                required
                value={newStudent.lastName}
                onChange={handleStudentInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="grade"
                label="Grade"
                fullWidth
                value={newStudent.grade || ''}
                onChange={handleStudentInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Guardian Information</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="guardianName"
                label="Guardian Name"
                fullWidth
                value={newStudent.guardianName || ''}
                onChange={handleStudentInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="guardianPhone"
                label="Guardian Phone"
                fullWidth
                value={newStudent.guardianPhone || ''}
                onChange={handleStudentInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="guardianEmail"
                label="Guardian Email"
                fullWidth
                value={newStudent.guardianEmail || ''}
                onChange={handleStudentInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={newStudent.address || ''}
                onChange={handleStudentInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStudentDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateStudent} 
            variant="contained"
            disabled={!newStudent.firstName || !newStudent.lastName}
          >
            Add Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolDetailPage; 
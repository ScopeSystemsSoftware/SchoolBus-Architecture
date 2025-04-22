import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../contexts/AuthContext';
import { createApiClient, Student } from '../services/api';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { token } = useAuth();
  const api = token ? createApiClient(token) : null;

  useEffect(() => {
    const fetchStudents = async () => {
      if (!api) return;
      
      try {
        setLoading(true);
        const data = await api.students.getAll();
        setStudents(data);
        setFilteredStudents(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [api]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.firstName.toLowerCase().includes(lowerCaseSearch) ||
        student.lastName.toLowerCase().includes(lowerCaseSearch) ||
        (student.school?.name && student.school.name.toLowerCase().includes(lowerCaseSearch))
    );
    
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (loading) {
    return <Typography>Loading students...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box className="page-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Students
        </Typography>
        <TextField
          placeholder="Search students..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Guardian</TableCell>
              <TableCell>Contact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {searchTerm ? 'No students match your search criteria' : 'No students found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                  <TableCell>{student.school?.name || 'N/A'}</TableCell>
                  <TableCell>{student.grade || 'N/A'}</TableCell>
                  <TableCell>{student.guardianName || 'N/A'}</TableCell>
                  <TableCell>{student.guardianPhone || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentsPage; 
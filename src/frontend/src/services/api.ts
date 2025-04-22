import axios from 'axios';

const BASE_URL = '/api';

export interface School {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  type?: string;
  geoLat?: number;
  geoLng?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  students?: Student[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  school?: School;
}

export interface CreateSchoolDto {
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  type?: string;
  geoLat?: number;
  geoLng?: number;
  active?: boolean;
}

export interface CreateStudentDto {
  schoolId: string;
  firstName: string;
  lastName: string;
  grade?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: string;
  active?: boolean;
}

export const createApiClient = (token: string) => {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const schoolsApi = {
    getAll: async (): Promise<School[]> => {
      const response = await api.get('/schools');
      return response.data;
    },
    getById: async (id: string): Promise<School> => {
      const response = await api.get(`/schools/${id}`);
      return response.data;
    },
    create: async (school: CreateSchoolDto): Promise<School> => {
      const response = await api.post('/schools', school);
      return response.data;
    },
    update: async (id: string, school: Partial<CreateSchoolDto>): Promise<School> => {
      const response = await api.put(`/schools/${id}`, school);
      return response.data;
    },
    delete: async (id: string): Promise<void> => {
      await api.delete(`/schools/${id}`);
    },
  };

  const studentsApi = {
    getAll: async (): Promise<Student[]> => {
      const response = await api.get('/students');
      return response.data;
    },
    getById: async (id: string): Promise<Student> => {
      const response = await api.get(`/students/${id}`);
      return response.data;
    },
    getBySchool: async (schoolId: string): Promise<Student[]> => {
      const response = await api.get(`/students/school/${schoolId}`);
      return response.data;
    },
    create: async (student: CreateStudentDto): Promise<Student> => {
      const response = await api.post('/students', student);
      return response.data;
    },
    update: async (id: string, student: Partial<CreateStudentDto>): Promise<Student> => {
      const response = await api.put(`/students/${id}`, student);
      return response.data;
    },
    delete: async (id: string): Promise<void> => {
      await api.delete(`/students/${id}`);
    },
  };

  return {
    schools: schoolsApi,
    students: studentsApi,
  };
}; 
import axios from 'axios';

/**
 * Creează și configurează o instanță axios pentru comunicarea cu API-ul
 * @param {string} tenantId ID-ul tenant-ului curent
 * @returns {axios.AxiosInstance} Instanță axios configurată
 */
const createApiClient = (tenantId) => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  
  const client = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      // Header pentru tenant ID - va fi procesat de API pentru a determina contextul tenant
      'x-tenant-id': tenantId
    }
  });
  
  // Interceptor pentru adăugarea tenant-ului în toate request-urile
  client.interceptors.request.use(
    (config) => {
      // Asigură-te că tenant-ul este întotdeauna inclus
      config.headers['x-tenant-id'] = tenantId;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Interceptor pentru procesarea răspunsurilor
  client.interceptors.response.use(
    (response) => {
      // Procesare răspuns de succes
      return response;
    },
    (error) => {
      // Procesare erori
      if (error.response) {
        // Eroare server (status code diferit de 2xx)
        console.error('Server error:', error.response.data);
        
        // Verifică dacă este o eroare legată de tenant
        if (error.response.status === 403 && 
            error.response.data.message?.toLowerCase().includes('tenant')) {
          console.error('Tenant access error:', error.response.data);
          // Aici putem adăuga logica pentru gestionarea erorilor specifice tenant-ului
        }
      } else if (error.request) {
        // Cererea a fost făcută dar nu s-a primit niciun răspuns
        console.error('No response received:', error.request);
      } else {
        // Eroare la setarea cererii
        console.error('Request error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

/**
 * API Service pentru gestionarea comunicării cu backend-ul
 */
class ApiService {
  constructor(tenantId) {
    this.client = createApiClient(tenantId);
  }
  
  /**
   * Actualizează tenant-ul pentru apiService
   * @param {string} tenantId Noul tenant ID
   */
  setTenant(tenantId) {
    this.client = createApiClient(tenantId);
  }
  
  /**
   * Obține toate școlile pentru tenant-ul curent
   */
  async getSchools() {
    try {
      const response = await this.client.get('/api/schools');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  }
  
  /**
   * Obține o școală după ID
   * @param {string} id ID-ul școlii
   */
  async getSchoolById(id) {
    try {
      const response = await this.client.get(`/api/schools/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching school ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Creează o școală nouă
   * @param {object} schoolData Datele școlii
   */
  async createSchool(schoolData) {
    try {
      const response = await this.client.post('/api/schools', schoolData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  }
  
  /**
   * Actualizează o școală existentă
   * @param {string} id ID-ul școlii
   * @param {object} schoolData Datele școlii
   */
  async updateSchool(id, schoolData) {
    try {
      const response = await this.client.put(`/api/schools/${id}`, schoolData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating school ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Șterge o școală
   * @param {string} id ID-ul școlii
   */
  async deleteSchool(id) {
    try {
      const response = await this.client.delete(`/api/schools/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting school ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Verifică starea serviciului
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking service health:', error);
      throw error;
    }
  }
}

export default ApiService; 
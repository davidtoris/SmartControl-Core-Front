import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Asegura que exista una sesión activa (autenticación transparente de fondo)
export const ensureAuthenticated = async (): Promise<string | null> => {
  let token = localStorage.getItem('token');
  
  if (!token) {
    console.log('🔑 SmartControl: Iniciando sesión administrativa en segundo plano...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@crece.com',
        password: '123456'
      });
      
      if (response.data && response.data.token) {
        token = response.data.token;
        localStorage.setItem('token', token!);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
        console.log('✅ SmartControl: Sesión autenticada correctamente en el backend.');
      }
    } catch (error) {
      console.error('❌ SmartControl: Error al autenticar en segundo plano:', error);
    }
  }
  
  return token;
};

// Interceptor de Solicitudes: Adjuntar Token JWT de forma reactiva
apiClient.interceptors.request.use(
  async (config) => {
    // Garantizar que la sesión esté lista antes de hacer cualquier petición
    const token = await ensureAuthenticated();
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas: Limpieza y auto-recuperación ante Tokens Caducados (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si la llamada devuelve 401 y no ha sido reintentada aún
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('⚠️ SmartControl: Token caducado o inválido. Re-autenticando...');
      
      // Limpiar credenciales antiguas
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Intentar forzar nueva sesión de fondo
      const newToken = await ensureAuthenticated();
      
      if (newToken && originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        // Re-ejecutar la petición original
        return apiClient(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

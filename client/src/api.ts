import axios from 'axios';

// Define a URL base para o seu backend.
const API_URL = '/api';

// Cria uma instância "pré-configurada" do axios.
const apiClient = axios.create({
    baseURL: API_URL,

    // A linha mais importante: instrui o axios a enviar o cookie de sessão.
    withCredentials: true
});

// Interceptor para lidar com sessões expiradas
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se a resposta for 401, a sessão é inválida. Redireciona para o login.
        if (error.response && error.response.status === 401) {
            // Evita loops de redirecionamento se já estiver na página de login
            if (window.location.pathname !== '/auth') {
                console.error("Sessão inválida ou expirada. Redirecionando para o login.");
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

// Exporta a instância configurada para ser usada em todo o seu app.
export default apiClient;

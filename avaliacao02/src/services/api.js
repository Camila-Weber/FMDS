import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://sua-api-biblioteca.com/api', // ajustar quando backend existir
})

// Exemplo de interceptor futuro para incluir token:
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

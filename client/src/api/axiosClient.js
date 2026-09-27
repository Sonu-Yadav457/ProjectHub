import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers:{
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
)

export default axiosClient;
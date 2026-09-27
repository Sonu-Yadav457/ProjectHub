import {createContext, useContext, useState, useEffect} from 'react';
import axiosClient from '../api/axiosClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        const verifyUser = async () => {
            try{
                const response = await axiosClient.get('/auth/me');
                setUser(response.data);
            }
            catch(error){
                setUser(null);
            }
            finally{
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    setUser(response.data.user);
    return response;
  };

  const register = async (name, email, password) => {
    const response = await axiosClient.post('/auth/register', { name, email, password });
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    await axiosClient.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
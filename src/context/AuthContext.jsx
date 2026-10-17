// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role === 'landlord') parsed.role = 'owner';
        setUser(parsed);
      } catch {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.role === 'landlord') data.role = 'owner';
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    if (data.role === 'landlord') data.role = 'owner';
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/profile', profileData);
    if (data.role === 'landlord') data.role = 'owner';
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const refreshProfile = async () => {
    try {
      const { data } = await API.get('/auth/profile');
      if (data.role === 'landlord') data.role = 'owner';
      const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const merged = { ...currentUser, ...data };
      localStorage.setItem('userInfo', JSON.stringify(merged));
      setUser(merged);
      return merged;
    } catch {
      return null;
    }
  };

  const toggleWishlist = async (roomId) => {
    if (!user) return false;
    try {
      const { data } = await API.post(`/auth/wishlist/${roomId}`);
      const updatedWishlist = data.wishlist || [];
      const updatedUser = { ...user, wishlist: updatedWishlist };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data.isWishlisted;
    } catch (err) {
      console.error('Wishlist toggle error', err);
      return false;
    }
  };

  const isWishlisted = (roomId) => {
    if (!user || !user.wishlist || !roomId) return false;
    return user.wishlist.some(
      (w) => (typeof w === 'string' ? w : w._id || w.id) === roomId
    );
  };

  const recordSearched = async (roomId) => {
    if (!user || !roomId) return;
    try {
      await API.post(`/auth/searched/${roomId}`);
    } catch {
      // Non-blocking
    }
  };

  const changePassword = async (passwordData) => {
    const { data } = await API.put('/auth/change-password', passwordData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        updateProfile,
        refreshProfile,
        changePassword,
        toggleWishlist,
        isWishlisted,
        recordSearched,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
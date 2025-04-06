import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { User, UserRole } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Проверяем валидность токена
          const response = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Логируем данные, полученные от сервера
          console.log('Profile data from server:', {
            response: response.data,
            responseJSON: JSON.stringify(response.data)
          });
          
          setUser(response.data);
        } catch (error) {
          // Если токен невалиден, очищаем локальное хранилище
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка при входе'
      };
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка при регистрации'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Проверка на наличие определенной роли
  const hasRole = (role: UserRole): boolean => {
    // Отладочный вывод для проверки роли пользователя
    console.log('Checking role:', { userRole: user?.role, requiredRole: role });
    
    // Проверяем совпадение в разных форматах
    if (!user || !user.role) {
      return false;
    }
    
    // Преобразуем роль пользователя в строку и в нижний регистр
    const userRoleStr = String(user.role).toLowerCase();
    
    // Проверяем различные форматы в зависимости от запрашиваемой роли
    switch (role) {
      case 'admin':
        return userRoleStr === 'admin' || 
               userRoleStr === 'администратор' || 
               userRoleStr === 'админ';
      case 'employee':
        return userRoleStr === 'employee' || 
               userRoleStr === 'сотрудник' || 
               userRoleStr === 'работник';
      case 'guest':
        return userRoleStr === 'guest' || 
               userRoleStr === 'гость' || 
               userRoleStr === 'пользователь' || 
               userRoleStr === 'user';
      default:
        return userRoleStr === role.toLowerCase();
    }
  };

  // Проверка на наличие одной из ролей
  const hasAnyRole = (roles: UserRole[]) => {
    if (!user || !user.role) return false;
    return roles.some(role => hasRole(role));
  };

  // Специальные методы для проверки конкретных ролей
  const isAdmin = (): boolean => {
    if (!user) return false;
    
    // Выводим дополнительное логирование для отладки
    console.log('isAdmin check details:', {
      user,
      role: user?.role,
      role_type: typeof user?.role,
      role_id: user?.role_id
    });
    
    // Проверяем разные форматы ролей
    if (user.role) {
      // Если роль это строка
      if (typeof user.role === 'string') {
        const roleStr = user.role.toLowerCase();
        // Добавляем поддержку значения "administrator"
        return roleStr === 'admin' || 
               roleStr === 'администратор' || 
               roleStr === 'админ' ||
               roleStr === 'administrator';
      }
      
      // Если роль это число (role_id)
      if (typeof user.role === 'number') {
        return user.role === 1;
      }
    }
    
    // Также проверяем прямое свойство role_id, если оно есть
    if (user.role_id) {
      return user.role_id === 1;
    }
    
    return false;
  };
  
  const isEmployee = (): boolean => {
    if (!user) return false;
    
    // Проверяем разные форматы ролей
    if (user.role) {
      // Если роль это строка
      if (typeof user.role === 'string') {
        const roleStr = user.role.toLowerCase();
        return roleStr === 'employee' || roleStr === 'сотрудник' || roleStr === 'работник';
      }
      
      // Если роль это число (role_id)
      if (typeof user.role === 'number') {
        return user.role === 2;
      }
    }
    
    // Также проверяем прямое свойство role_id, если оно есть
    if (user.role_id) {
      return user.role_id === 2;
    }
    
    return false;
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isAdmin,
    isEmployee,
    isAuthenticated: !!user
  };
}; 
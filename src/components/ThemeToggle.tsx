import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';

// Примечание: этот компонент больше не используется, так как переключатель темы
// теперь реализован непосредственно в компоненте Navigation.tsx
export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant={theme === 'light' ? 'outline-dark' : 'outline-light'} 
      className="theme-toggle rounded-circle p-2" 
      onClick={toggleTheme}
      size="sm"
      aria-label={theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'}
      style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
    </Button>
  );
}; 
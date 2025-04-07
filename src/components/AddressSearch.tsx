import React, { useState, useEffect, useRef } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
  isInvalid?: boolean;
  error?: string;
}

interface DaDataSuggestion {
  value: string;
  unrestricted_value: string;
  data: {
    postal_code?: string;
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    house?: string;
  };
}

const AddressSearch: React.FC<AddressSearchProps> = ({ value, onChange, isInvalid, error }) => {
  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { theme } = useTheme();

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Token 455947aa93559ffa090d9ca27182444d3ca09d41'
          },
          body: JSON.stringify({
            query: query,
            count: 10,
            language: 'ru',
            locations: [
              { country: 'Беларусь' }
            ]
          })
        }
      );

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Ошибка при поиске адреса:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchAddress(query);
    }, 300);
  };

  const formatAddress = (suggestion: DaDataSuggestion): string => {
    return suggestion.value;
  };

  const handleSuggestionClick = (suggestion: DaDataSuggestion) => {
    const formattedAddress = formatAddress(suggestion);
    onChange(formattedAddress);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="position-relative">
      <InputGroup>
        <InputGroup.Text>
          <FontAwesomeIcon icon={faMapMarkerAlt} />
        </InputGroup.Text>
        <Form.Control
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="Введите адрес"
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          isInvalid={isInvalid}
        />
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      {isLoading && (
        <div className="position-absolute end-0 top-50 translate-middle-y me-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className={`position-absolute w-100 mt-1 border rounded shadow-sm ${theme === 'light' ? 'bg-white' : ''}`}
          style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.value}
              className="p-2 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : '#3a3a3a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme === 'light' ? 'white' : '#2c2c2c')}
            >
              {formatAddress(suggestion)}
            </div>
          ))}
        </div>
      )}
      </InputGroup>
    </div>
  );
};

export default AddressSearch; 
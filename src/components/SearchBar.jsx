import React from 'react';
import { Box, InputBase, IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { X } from 'lucide-react';

const SearchBar = ({ placeholder, value, onChange, width }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '20px',
        px: 2,
        py: 0.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        '&:focus-within': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: 'rgba(0, 0, 0, 0.12)'
        },
        transition: 'all 0.2s ease-in-out',
        width: width || { xs: '100%', md: '350px' },
        height: '42px'
      }}
    >
      <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
      <InputBase
        fullWidth
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={onChange}
        sx={{ 
          flex: 1
        }}
      />
      {value && (
        <IconButton 
          onClick={() => onChange({ target: { value: '' } })} 
          edge="end"
          sx={{ 
            p: 0.5, 
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          <X size={16} />
        </IconButton>
      )}
    </Box>
  );
};

export default SearchBar; 
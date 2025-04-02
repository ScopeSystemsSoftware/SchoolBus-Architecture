import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Avatar } from '@mui/material';
import { useTenant } from './TenantContext';

/**
 * Componentă pentru selectarea tenant-ului în aplicație
 */
const TenantSelector = () => {
  const { currentTenant, availableTenants, changeTenant } = useTenant();
  
  const handleChange = (event) => {
    changeTenant(event.target.value);
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
      <Typography variant="subtitle1" sx={{ mr: 2, my: 1 }}>
        Organizație:
      </Typography>
      
      <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="tenant-selector-label">Selectează organizația</InputLabel>
        <Select
          labelId="tenant-selector-label"
          id="tenant-selector"
          value={currentTenant.id}
          onChange={handleChange}
          label="Selectează organizația"
        >
          {availableTenants.map((tenant) => (
            <MenuItem key={tenant.id} value={tenant.id}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    mr: 1, 
                    bgcolor: tenant.color,
                    fontSize: '0.8rem'
                  }}
                >
                  {tenant.name.substring(0, 1)}
                </Avatar>
                {tenant.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TenantSelector; 
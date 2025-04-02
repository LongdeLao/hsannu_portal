import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { format, addMinutes } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import { API_URL } from '../config';
import { v4 as uuidv4 } from 'uuid';

// MUI Components
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Stack,
  Tooltip,
  Alert,
  styled,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Icons
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Import Switch component
import { Switch } from '@mui/material';

// Custom Apple-like toggle component
const IOSSwitch = styled((props) => (
  <Switch {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 2,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#000000',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

// Custom styled components for rounded inputs
const RoundedTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '& fieldset': {
      borderWidth: 1,
    },
  },
});

const RoundedSelect = styled(Select)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
  },
  borderRadius: 12,
});

const RoundedDatePicker = styled(DatePicker)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
  },
});

const RoundedTimePicker = styled(TimePicker)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
  },
});

function NewEventForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine user role from URL path
  const userRole = location.pathname.includes('/student/') ? 'student' : 'staff';
  
  // State for form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  
  // Form with react-hook-form
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      eventDescription: '',
      address: 'All',
      eventDate: new Date(),
      isWholeDay: true,
      startTime: new Date(),
      endTime: addMinutes(new Date(), 60),
    }
  });
  
  // Watch values for conditional rendering
  const isWholeDay = watch('isWholeDay');
  
  // Address options
  const addresses = ["All", "PIB", "IB1", "IB2", "Staff"];

  // Dropzone for image uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: acceptedFiles => {
      const newImages = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  });

  // Remove image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add event data to formData
      formData.append('eventID', crypto.randomUUID());
      formData.append('authorID', '1'); // TODO: Get from auth context
      formData.append('authorName', 'John Doe'); // TODO: Get from auth context
      formData.append('title', data.title);
      formData.append('eventDescription', data.eventDescription);
      formData.append('address', data.address);
      formData.append('eventDate', data.eventDate.toISOString());
      formData.append('isWholeDay', data.isWholeDay.toString());
      
      // Add time fields if not a whole day event
      if (!data.isWholeDay) {
        formData.append('startTime', data.startTime.toISOString());
        formData.append('endTime', data.endTime.toISOString());
      }

      // Add images to formData
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Log the form data (for debugging)
      console.log('Form data being sent:', Object.fromEntries(formData));
      
      const response = await fetch(`${API_URL}/api/post_event`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const responseData = await response.json();
      console.log('Event created successfully:', responseData);
      
      // Redirect back to events page
      navigate(`/${userRole}/events`);
      
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box mb={3} display="flex" alignItems="center">
          <Tooltip title="Back to Events">
            <IconButton 
              onClick={() => navigate(`/${userRole}/events`)} 
              edge="start" 
              sx={{ mr: 2, borderRadius: 8 }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Create New Event
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 1. Event Title */}
            <Box mb={3}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <RoundedTextField
                    {...field}
                    label="Event Title"
                    variant="outlined"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message || `${field.value.length}/50 characters`}
                    inputProps={{ maxLength: 50 }}
                    InputProps={{
                      endAdornment: field.value ? (
                        <IconButton size="small" onClick={() => setValue('title', '')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ) : null
                    }}
                  />
                )}
              />
            </Box>

            {/* 2. Event Description */}
            <Box mb={3}>
              <Controller
                name="eventDescription"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <RoundedTextField
                    {...field}
                    label="Event Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.eventDescription}
                    helperText={errors.eventDescription?.message || `${field.value.length}/3000 characters`}
                    inputProps={{ maxLength: 3000 }}
                  />
                )}
              />
            </Box>

            {/* 3. Images */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ImageIcon sx={{ mr: 1 }} /> Images
              </Typography>
              
              <Box 
                {...getRootProps()} 
                sx={{ 
                  border: '2px dashed', 
                  borderColor: 'divider',
                  borderRadius: 4,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 2,
                  bgcolor: 'action.hover',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  }
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography>
                  Drag & drop images here, or click to select files
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG, GIF up to 5MB
                </Typography>
              </Box>
              
              {images.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {images.map((file, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        position: 'relative', 
                        width: 80, 
                        height: 80,
                        borderRadius: 3,
                        overflow: 'hidden',
                        '&:hover .MuiBox-root': { opacity: 1 }
                      }}
                    >
                      <img 
                        src={file.preview} 
                        alt={`Preview ${index}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <Box 
                        className="MuiBox-root"
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          right: 0, 
                          bottom: 0, 
                          bgcolor: 'rgba(0,0,0,0.5)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }} 
                          sx={{ color: 'white', borderRadius: 8 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 4. Address Selection */}
            <Box mb={3} display="flex" alignItems="flex-start">
              <GroupsIcon sx={{ mr: 1, mt: 2, color: 'text.secondary' }} />
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="address-label" sx={{ borderRadius: 12 }}>Addresses</InputLabel>
                    <RoundedSelect {...field} labelId="address-label" label="Addresses">
                      {addresses.map((addr) => (
                        <MenuItem 
                          key={addr} 
                          value={addr}
                        >
                          {addr}
                        </MenuItem>
                      ))}
                    </RoundedSelect>
                  </FormControl>
                )}
              />
            </Box>

            {/* 5. Event Date */}
            <Box mb={3} display="flex" alignItems="flex-start">
              <EventIcon sx={{ mr: 1, mt: 2, color: 'text.secondary' }} />
              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Event Date"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 3 } }
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* 6. All Day Toggle */}
            <Box mb={3} display="flex" alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', height: '40px', mr: 1 }}>
                <AccessTimeIcon sx={{ color: 'text.secondary' }} />
              </Box>
              <Controller
                name="isWholeDay"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    label="All Day Event"
                    labelPlacement="start"
                    control={
                      <IOSSwitch 
                        checked={value} 
                        onChange={(e) => onChange(e.target.checked)} 
                        {...field}
                      />
                    }
                    sx={{ 
                      ml: 0, 
                      py: 1, 
                      px: 2, 
                      borderRadius: 3, 
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                      '& .MuiFormControlLabel-label': {
                        marginRight: 3
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* Time Selection - Only visible if not All Day */}
            <Box mb={3} sx={{ pl: 4, minHeight: 80 }}>
              {!isWholeDay ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Start Time"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            sx: { '& .MuiOutlinedInput-root': { borderRadius: 3 } }
                          }
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="End Time"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            sx: { '& .MuiOutlinedInput-root': { borderRadius: 3 } }
                          }
                        }}
                      />
                    )}
                  />
                </Stack>
              ) : null}
            </Box>

            {/* Submit Button */}
            <Box mt={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isSubmitting}
                sx={{ 
                  py: 1.5, 
                  bgcolor: 'black', 
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  borderRadius: 3,
                }}
                startIcon={<UploadIcon />}
              >
                {isSubmitting ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default NewEventForm; 
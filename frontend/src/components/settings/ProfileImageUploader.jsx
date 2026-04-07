import React, { useRef } from 'react';
import { Avatar, Box, Button, Stack, Typography } from '@mui/material';
import { CameraAlt as CameraIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';

const ProfileImageUploader = ({ value, onChange, onDelete }) => {
    const inputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box sx={{ position: 'relative' }}>
                <Avatar src={value || ''} sx={{ width: 88, height: 88 }}>
                    <CameraIcon />
                </Avatar>
            </Box>
            <Box>
                <Typography fontWeight={700}>Profile Picture</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    JPG, PNG, or GIF up to 5MB. Upload updates your profile preview immediately.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button startIcon={<UploadIcon />} variant="contained" onClick={() => inputRef.current?.click()}>
                        Upload
                    </Button>
                    <Button startIcon={<DeleteIcon />} variant="outlined" color="inherit" onClick={onDelete}>
                        Remove
                    </Button>
                </Stack>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    hidden
                    onChange={(event) => handleFile(event.target.files?.[0])}
                />
            </Box>
        </Stack>
    );
};

export default ProfileImageUploader;

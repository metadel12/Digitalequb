import React, { useMemo, useRef } from 'react';
import { Stack, TextField } from '@mui/material';

function OTPInput({ value = '', onChange, length = 6 }) {
    const digits = Array.from({ length }, (_, index) => value[index] || '');
    const refs = useRef([]);
    const paddedValue = useMemo(() => value.padEnd(length, ' ').slice(0, length), [length, value]);

    const handleChange = (index, nextValue) => {
        const clean = nextValue.replace(/\D/g, '');
        const chars = paddedValue.split('');
        chars[index] = clean.slice(-1);
        const merged = chars.join('').replace(/\s/g, '').slice(0, length);
        onChange(merged);
        if (clean && refs.current[index + 1]) {
            refs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace' && !digits[index] && refs.current[index - 1]) {
            refs.current[index - 1].focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted);
    };

    return (
        <Stack direction="row" spacing={1.25} onPaste={handlePaste}>
            {digits.map((digit, index) => (
                <TextField
                    key={index}
                    inputRef={(element) => {
                        refs.current[index] = element;
                    }}
                    value={digit}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    inputProps={{
                        maxLength: 1,
                        inputMode: 'numeric',
                        style: { textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 },
                        'aria-label': `OTP digit ${index + 1}`,
                    }}
                    sx={{ width: 52 }}
                />
            ))}
        </Stack>
    );
}

export default OTPInput;

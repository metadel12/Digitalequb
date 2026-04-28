import { useTheme } from '../../context/ThemeContext';

export default function DashboardLayout({ header, children }) {
    const { isDarkMode } = useTheme();

    return (
        <div style={{
            minHeight: '100vh',
            background: isDarkMode
                ? 'linear-gradient(180deg,#0f172a 0%,#1e1b4b 100%)'
                : 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)',
        }}>
            <div style={{ maxWidth: 1280, margin: '0', padding: '32px 24px' }}>
                {header}
                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

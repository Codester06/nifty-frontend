import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/shared/hooks/useAuth';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import { AppRoutes } from './router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
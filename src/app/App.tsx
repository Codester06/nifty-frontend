import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/shared/hooks/useAuth';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorNotificationContainer } from '@/components/ui/ErrorNotificationContainer';
import { AppRoutes } from './router';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <ErrorNotificationContainer />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
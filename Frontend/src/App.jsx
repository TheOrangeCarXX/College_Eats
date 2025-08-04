import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Restaurant from './Restaurant';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute>
              <Restaurant />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
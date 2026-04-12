import { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isDemo: false,
  isHydrating: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, isDemo: action.payload.isDemo, isHydrating: false };
    case 'LOGOUT':
      return { ...initialState, isHydrating: false };
    case 'RESTORE':
      return { ...state, ...action.payload };
    case 'HYDRATION_DONE':
      return { ...state, isHydrating: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('hl_token');
      const userStr = localStorage.getItem('hl_user');
      if (!token || !userStr) {
        dispatch({ type: 'HYDRATION_DONE' });
        return;
      }

      try {
        const cachedUser = JSON.parse(userStr);
        const isDemo = token === 'demo-token';
        if (isDemo) {
          dispatch({ type: 'RESTORE', payload: { user: cachedUser, token, isDemo } });
          return;
        }

        dispatch({ type: 'RESTORE', payload: { user: cachedUser, token, isDemo: false } });
        const { data } = await getMe();
        const refreshedUser = data?.data || cachedUser;
        localStorage.setItem('hl_user', JSON.stringify(refreshedUser));
        dispatch({ type: 'LOGIN', payload: { user: refreshedUser, token, isDemo: false } });
      } catch (e) {
        localStorage.removeItem('hl_token');
        localStorage.removeItem('hl_user');
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'HYDRATION_DONE' });
      }
    };

    restoreSession();
  }, []);

  const login = (userData, token, isDemo = false) => {
    localStorage.setItem('hl_token', token);
    localStorage.setItem('hl_user', JSON.stringify(userData));
    dispatch({ type: 'LOGIN', payload: { user: userData, token, isDemo } });
    toast.success(`Welcome, ${userData.name}!`);
  };

  const logout = () => {
    localStorage.removeItem('hl_token');
    localStorage.removeItem('hl_user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const demoLogin = () => {
    const demoUser = { id: 1, name: 'Admin User', email: 'admin@harvest.bd', phone: '+8801700000001', role: 'admin', location: 'Dhaka' };
    login(demoUser, 'demo-token', true);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
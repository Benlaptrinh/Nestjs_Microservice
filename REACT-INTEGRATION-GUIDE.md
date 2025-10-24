# ⚛️ React Integration Guide

## 🚀 Quick Start

### 1. Tạo React App

```bash
# Option 1: Create React App
npx create-react-app quiz-frontend
cd quiz-frontend

# Option 2: Vite (recommended - faster)
npm create vite@latest quiz-frontend -- --template react
cd quiz-frontend
npm install
```

### 2. Install Dependencies

```bash
npm install axios react-router-dom
```

---

## 🔐 OAuth Login Integration

### Setup Router (App.jsx)

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OAuthCallback from './pages/OAuthCallback';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 📄 Page Components

### LoginPage.jsx

```jsx
import React from 'react';
import './LoginPage.css';

function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:3001/auth/github';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚀 Quiz App</h1>
        <p className="subtitle">Login to continue</p>

        <div className="oauth-buttons">
          <button className="btn-google" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button className="btn-github" onClick={handleGithubLogin}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
```

### OAuthCallback.jsx

```jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      alert('Login failed: ' + error);
      navigate('/');
      return;
    }

    if (token) {
      // Save token to localStorage
      localStorage.setItem('jwt_token', token);

      // Decode token to get user info (optional)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Logged in as:', payload.email);
      } catch (e) {
        console.error('Failed to decode token');
      }

      // Redirect to profile
      navigate('/profile');
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Processing login...</h2>
      <p>Please wait...</p>
    </div>
  );
}

export default OAuthCallback;
```

### ProfilePage.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3002/students/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
      setLoading(false);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('jwt_token');
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Profile</h1>
      
      {profile && (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Full Name:</strong> {profile.fullName || 'N/A'}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Total Images:</strong> {profile.totalImages || 0}</p>
          
          {profile.avatar && (
            <div>
              <p><strong>Avatar:</strong></p>
              <img 
                src={profile.avatar} 
                alt="Avatar" 
                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
              />
            </div>
          )}
        </div>
      )}

      <button 
        onClick={handleLogout}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px',
          background: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default ProfilePage;
```

---

## 🎨 Styling (LoginPage.css)

```css
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.oauth-buttons button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.oauth-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-google {
  background: #4285f4;
}

.btn-google:hover {
  background: #357ae8;
}

.btn-github {
  background: #24292e;
}

.btn-github:hover {
  background: #1a1e22;
}
```

---

## 🔧 API Service (Optional)

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';
const AUTH_BASE_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const authAPI = {
  loginGoogle: () => {
    window.location.href = `${AUTH_BASE_URL}/auth/google`;
  },
  
  loginGithub: () => {
    window.location.href = `${AUTH_BASE_URL}/auth/github`;
  },
  
  logout: () => {
    localStorage.removeItem('jwt_token');
  },
};

export const profileAPI = {
  getProfile: () => api.get('/students/profile'),
  
  updateProfile: (data) => api.put('/students/profile', data),
  
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.put('/students/profile', formData);
  },
};

export const imageAPI = {
  uploadImages: (files, type = 'gallery') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', type);
    return api.post('/students/images', formData);
  },
  
  getImages: () => api.get('/students/images'),
  
  deleteImages: (imageIds) => 
    api.delete('/students/images', { data: { imageIds } }),
};

export default api;
```

---

## 🧪 Testing Checklist

### 1. Start Backend Services
```bash
# Terminal 1: Auth service
npm run start:auth

# Terminal 2: Student service  
npm run start:student
```

### 2. Start React App
```bash
# Terminal 3: React
npm start
# Or with Vite:
npm run dev
```

### 3. Test OAuth Flow
- [ ] Open http://localhost:3000
- [ ] Click "Continue with Google"
- [ ] Login with Google account
- [ ] Should redirect to /auth/callback
- [ ] Token saved to localStorage
- [ ] Redirect to /profile
- [ ] Profile data displayed

- [ ] Repeat with GitHub login

### 4. Test Profile API
- [ ] Profile shows email, role
- [ ] Token persists on page refresh
- [ ] Logout clears token
- [ ] Unauthorized redirects to login

---

## 🚀 Environment Variables

Create `.env` in React root:

```bash
REACT_APP_API_URL=http://localhost:3002
REACT_APP_AUTH_URL=http://localhost:3001
```

Update API service:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const AUTH_BASE_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:3001';
```

---

## 🔒 Protected Routes

Create `ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('jwt_token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

Use in `App.jsx`:

```jsx
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

---

## 📋 Backend CORS Config

**Already configured!** Both services allow:
- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)

**Callback URLs configured:**
- Google: `http://localhost:3001/auth/google/callback` → redirects to `http://localhost:3000/auth/callback?token=...`
- GitHub: `http://localhost:3001/auth/github/callback` → redirects to `http://localhost:3000/auth/callback?token=...`

---

## ✅ Summary

**What's ready:**
- ✅ CORS enabled on Auth Service (port 3001)
- ✅ CORS enabled on Student Service (port 3002)
- ✅ OAuth callbacks redirect to React (`http://localhost:3000/auth/callback`)
- ✅ JWT token passed via URL query params
- ✅ Profile API protected with JWT

**React app needs:**
1. Login page with Google/GitHub buttons
2. OAuth callback page to handle token
3. Profile page to display user data
4. Router setup (react-router-dom)
5. API service (axios)

**Ready to code! 🚀**

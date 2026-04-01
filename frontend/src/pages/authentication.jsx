import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { handleLogin, handleRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!username || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await handleLogin(username, password);
      } else {
        await handleRegister(name, username, password);
        await handleLogin(username, password);
      }
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='authContainer'>
      <div className='authCard'>
        <div className='authHeader'>
          <h1 className='authLogo'>SyncMeet</h1>
          <p className='authTagline'>Video calls, simplified.</p>
        </div>

        <div className='authTabs'>
          <button
            className={`authTab ${isLogin ? 'authTabActive' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            className={`authTab ${!isLogin ? 'authTabActive' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        <div className='authForm'>
          {!isLogin && (
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              sx={authFieldSx}
            />
          )}
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
            sx={authFieldSx}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            sx={authFieldSx}
          />

          {error && <p className='authError'>{error}</p>}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #FF9839, #ff6b35)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              py: 1.5,
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #ff8520, #ff5722)' }
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </Button>
        </div>

        <p className='authSwitch'>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

const authFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,152,57,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#FF9839' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#FF9839' },
};
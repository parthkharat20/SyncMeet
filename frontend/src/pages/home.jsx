import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth.jsx';
import IconButton from '@mui/material/IconButton';
import '../App.css';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

// FIX: useSatet typo → useState (was crashing on import)
function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [newCode] = useState(() => Math.random().toString(36).substring(2, 9).toUpperCase());
  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  let handleNewMeeting = async () => {
    await addToUserHistory(newCode);
    navigate(`/${newCode}`);
  };

  let handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className='homeContainer'>
      {/* Navbar */}
      <div className='homeNav'>
        <h2 className='homeLogo'>SyncMeet</h2>
        <div className='homeNavRight'>
          <IconButton onClick={() => navigate("/history")} title="History" sx={{ color: '#aaa' }}>
            <RestoreIcon />
          </IconButton>
          <span className='homeNavLabel'>History</span>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ color: '#aaa', textTransform: 'none', ml: 1 }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className='homeMain'>
        <div className='homeLeft'>
          <div className='homeGreeting'>Good to see you 👋</div>
          <h1 className='homeHeadline'>
            Quality Video Calls,<br />
            <span className='homeAccent'>Anytime. Anywhere.</span>
          </h1>
          <p className='homeSubtext'>
            Start a new meeting instantly or join with a code.
          </p>

          <div className='homeMeetActions'>
            {/* New meeting */}
            <div className='homeMeetCard newMeet' onClick={handleNewMeeting}>
              <div className='homeMeetIcon'><AddIcon /></div>
              <div>
                <p className='homeMeetTitle'>New Meeting</p>
                <p className='homeMeetSub'>Start instantly</p>
              </div>
            </div>

            {/* Join with code */}
            <div className='homeMeetCard joinMeet'>
              <div className='joinInputRow'>
                <TextField
                  label="Meeting Code"
                  variant="outlined"
                  size="small"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinVideoCall()}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,152,57,0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#FF9839' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#FF9839' },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleJoinVideoCall}
                  sx={{
                    background: '#FF9839',
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3,
                    '&:hover': { background: '#e8872a' }
                  }}
                >
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='homeRight'>
          <div className='homeIllustration'>
            <div className='illGrid'>
              <div className='illTile'><span>A</span></div>
              <div className='illTile active'><span>B</span></div>
              <div className='illTile'><span>C</span></div>
              <div className='illTile'><span>D</span></div>
            </div>
            <div className='illBar'>
              <div className='illDot red' />
              <div className='illDot' />
              <div className='illDot' />
              <div className='illDot' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);
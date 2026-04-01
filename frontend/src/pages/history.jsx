import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import withAuth from "../utils/withAuth.jsx";

// FIX: was using placeholder "Word of the Day" card content — now shows real meeting data
// FIX: added withAuth protection, proper error handling, and loading state
function History() {
  const { getHistoryOfUser, addToUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        // newest first
        setMeetings([...history].reverse());
      } catch (e) {
        setError('Could not load meeting history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleRejoin = async (code) => {
    await addToUserHistory(code);
    routeTo(`/${code}`);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className='historyContainer'>
      <div className='historyNav'>
        <IconButton onClick={() => routeTo("/home")} sx={{ color: 'white' }}>
          <HomeIcon />
        </IconButton>
        <h2 className='historyTitle'>Meeting History</h2>
      </div>

      <div className='historyContent'>
        {loading && (
          <div className='historyEmpty'>
            <p>Loading...</p>
          </div>
        )}

        {!loading && error && (
          <div className='historyEmpty'>
            <p className='historyError'>{error}</p>
            <Button onClick={() => routeTo('/home')} sx={{ color: '#FF9839', mt: 2 }}>
              Go Home
            </Button>
          </div>
        )}

        {!loading && !error && meetings.length === 0 && (
          <div className='historyEmpty'>
            <VideoCallIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.15)', mb: 2 }} />
            <p>No meetings yet.</p>
            <Button
              variant="contained"
              onClick={() => routeTo('/home')}
              sx={{ background: '#FF9839', mt: 2, textTransform: 'none', borderRadius: '10px' }}
            >
              Start your first meeting
            </Button>
          </div>
        )}

        {!loading && !error && meetings.length > 0 && (
          <div className='historyList'>
            {meetings.map((meeting, idx) => (
              <div className='historyCard' key={meeting._id || idx}>
                <div className='historyCardLeft'>
                  <div className='historyCodeBadge'>
                    <VideoCallIcon sx={{ fontSize: 18 }} />
                    <span>{meeting.meetingCode}</span>
                  </div>
                  <div className='historyDateRow'>
                    <AccessTimeIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                    <span className='historyDate'>{formatDate(meeting.date)}</span>
                  </div>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleRejoin(meeting.meetingCode)}
                  sx={{
                    color: '#FF9839',
                    borderColor: '#FF9839',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { background: 'rgba(255,152,57,0.1)', borderColor: '#FF9839' }
                  }}
                >
                  Rejoin
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(History);
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h2>SyncMeet</h2>
        </div>
        <div className='navlist'>
          <p onClick={() => navigate('/auth')}>Join as Guest</p>
          <p onClick={() => navigate('/auth')}>Register</p>
          <div role='button' onClick={() => navigate('/auth')}>
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div className='landingContent'>
          <div className='landingBadge'>✦ Secure &amp; Fast</div>
          <h1>
            <span className='landingAccent'>Connect</span> with your<br />loved ones
          </h1>
          <p className='landingSubtitle'>
            Experience seamless video conferencing with SyncMeet.<br />
            Connect, collaborate, and communicate effortlessly.
          </p>
          <div className='landingActions'>
            <Link to="/auth" className='landingBtnPrimary'>Get Started →</Link>
            <Link to="/auth" className='landingBtnSecondary'>Learn More</Link>
          </div>
          <div className='landingStats'>
            <div className='stat'><span>10K+</span><p>Users</p></div>
            <div className='statDivider' />
            <div className='stat'><span>99.9%</span><p>Uptime</p></div>
            <div className='statDivider' />
            <div className='stat'><span>HD</span><p>Quality</p></div>
          </div>
        </div>
        <div className='landingVisual'>
          <div className='videoMockup'>
            <div className='mockupScreen'>
              <div className='mockupGrid'>
                <div className='mockupTile'><div className='mockupAvatar'>A</div></div>
                <div className='mockupTile active'><div className='mockupAvatar'>B</div></div>
                <div className='mockupTile'><div className='mockupAvatar'>C</div></div>
                <div className='mockupTile'><div className='mockupAvatar'>D</div></div>
              </div>
              <div className='mockupControls'>
                <div className='mockupBtn red' />
                <div className='mockupBtn' />
                <div className='mockupBtn' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
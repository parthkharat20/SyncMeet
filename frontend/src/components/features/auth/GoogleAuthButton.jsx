import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// Official Google G Logo SVG
const GoogleLogoSvg = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z"
      fill="#4285F4"
    />
    <path
      d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
      fill="#34A853"
    />
    <path
      d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleAuthButton = ({ onGoogleSuccess, onError, disabled = false, text = "Continue with Google" }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const isConfigured = Boolean(clientId && !clientId.includes("YOUR_") && clientId.length > 10);

  // Hook for Google Identity Popup
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsProcessing(true);
      try {
        // If credential JWT is returned directly
        if (tokenResponse.credential) {
          await onGoogleSuccess(tokenResponse.credential);
        } else if (tokenResponse.access_token) {
          // Fetch user info with access token to package standard profile
          const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          const profile = await userRes.json();
          // Create synthetic JWT payload for backend verification
          const syntheticJwt = `${btoa(JSON.stringify({ alg: "RS256" }))}.${btoa(
            JSON.stringify({
              sub: profile.sub,
              email: profile.email,
              name: profile.name,
              picture: profile.picture,
            })
          )}.signature`;
          await onGoogleSuccess(syntheticJwt);
        }
      } catch (err) {
        if (onError) onError(err);
      } finally {
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      console.warn("[GOOGLE AUTH POPUP ERROR]", error);
      if (onError) onError(error);
    },
  });

  const handleClick = (e) => {
    e.preventDefault();
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }
    loginWithGoogle();
  };

  const copyEnvCode = () => {
    navigator.clipboard.writeText("VITE_GOOGLE_CLIENT_ID=your_google_client_id_here\nGOOGLE_CLIENT_ID=your_google_client_id_here");
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        style={{
          width: "100%",
          height: "46px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-white)",
          fontSize: "14px",
          fontWeight: "600",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          cursor: disabled || isProcessing ? "not-allowed" : "pointer",
          transition: "all 200ms ease",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isProcessing) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.09)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.28)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px rgba(88, 101, 242, 0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isProcessing) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
          }
        }}
      >
        <GoogleLogoSvg />
        <span>{isProcessing ? "Connecting to Google..." : text}</span>
      </button>

      {/* Interactive Google OAuth Setup Helper Modal */}
      {showConfigModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-lg)",
              padding: "28px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8), 0 0 30px rgba(88, 101, 242, 0.25)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(88, 101, 242, 0.15)",
                    border: "1px solid rgba(88, 101, 242, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <InfoOutlinedIcon style={{ color: "var(--primary-blurple)", fontSize: "20px" }} />
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-white)", margin: 0 }}>
                  Google OAuth Setup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CloseIcon style={{ fontSize: "18px" }} />
              </button>
            </div>

            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", margin: "0 0 16px 0" }}>
              To enable 1-click Google Sign-In, add your free Google OAuth Client ID to your <code>.env</code> file:
            </p>

            <ol style={{ paddingLeft: "20px", margin: "0 0 18px 0", fontSize: "13px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                Open{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent-cyan)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "2px" }}
                >
                  Google Cloud Console <OpenInNewIcon style={{ fontSize: "13px" }} />
                </a>
              </li>
              <li>Create <b>OAuth Client ID</b> (Web application).</li>
              <li>Add <code>http://localhost:5173</code> to <b>Authorized JavaScript origins</b>.</li>
              <li>Copy the Client ID into <code>frontend/.env</code> and <code>backend/.env</code>.</li>
            </ol>

            {/* Code Box */}
            <div
              style={{
                background: "#090a10",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--accent-green)",
              }}
            >
              <span>VITE_GOOGLE_CLIENT_ID=your_id_here</span>
              <button
                type="button"
                onClick={copyEnvCode}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  color: "#ffffff",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {copiedEnv ? <CheckIcon style={{ fontSize: "13px", color: "var(--accent-green)" }} /> : <ContentCopyIcon style={{ fontSize: "13px" }} />}
                <span>{copiedEnv ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                style={{
                  background: "var(--primary-blurple)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;

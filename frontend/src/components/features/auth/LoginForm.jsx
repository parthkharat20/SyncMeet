import React, { useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Alert from "../../ui/Alert";
import GoogleAuthButton from "./GoogleAuthButton";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

export const LoginForm = ({ onSubmit, onGoogleSuccess, loading, externalError }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = "Username is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(username.trim(), password);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {externalError && <Alert variant="error">{externalError}</Alert>}

      {/* ── 1-Click Google OAuth Sign-In ── */}
      {onGoogleSuccess && (
        <>
          <GoogleAuthButton
            onGoogleSuccess={onGoogleSuccess}
            text="Continue with Google"
            disabled={loading}
          />

          {/* Elegant Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "2px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Or sign in with username
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
          </div>
        </>
      )}

      {/* ── Username & Password Form ── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <Input
          label="Username"
          icon={PersonIcon}
          placeholder="Enter your username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: "" }));
          }}
          error={fieldErrors.username}
          autoComplete="username"
        />

        <Input
          label="Password"
          icon={LockIcon}
          type="password"
          passwordToggle={true}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <Button type="submit" variant="primary" size="lg" fullWidth={true} loading={loading}>
          Sign In to SyncMeet
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;

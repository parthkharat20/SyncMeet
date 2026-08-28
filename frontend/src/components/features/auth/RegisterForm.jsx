import React, { useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Alert from "../../ui/Alert";
import PasswordStrengthBar from "./PasswordStrengthBar";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

export const RegisterForm = ({ onSubmit, loading, externalError }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Full Name is required";
    if (!username.trim()) errors.username = "Username is required";
    else if (username.trim().length < 3) errors.username = "Username must be at least 3 characters";

    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters long";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(name.trim(), username.trim(), password);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {externalError && <Alert variant="error">{externalError}</Alert>}

      <Input
        label="Full Name"
        icon={BadgeIcon}
        placeholder="e.g. Alex Morgan"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
        }}
        error={fieldErrors.name}
      />

      <Input
        label="Username"
        icon={PersonIcon}
        placeholder="Choose a unique username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: "" }));
        }}
        error={fieldErrors.username}
        helperText="At least 3 alphanumeric characters"
        autoComplete="username"
      />

      <div>
        <Input
          label="Password"
          icon={LockIcon}
          type="password"
          passwordToggle={true}
          placeholder="Create a secure password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        <PasswordStrengthBar password={password} />
      </div>

      <Button type="submit" variant="green" size="lg" fullWidth={true} loading={loading}>
        Create Free Account
      </Button>
    </form>
  );
};

export default RegisterForm;

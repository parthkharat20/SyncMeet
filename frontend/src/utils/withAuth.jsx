import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// FIX: added missing React + useNavigate imports; replaced router.push with navigate()
const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();

    const isAuthenticated = () => {
      return !!localStorage.getItem("token");
    };

    useEffect(() => {
      if (!isAuthenticated()) {
        navigate("/auth");
      }
    }, []);

    if (!isAuthenticated()) return null;

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
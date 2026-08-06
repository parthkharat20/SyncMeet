import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const { loading } = useContext(AuthContext);

    const isAuthenticated = () => {
      return !!localStorage.getItem("token");
    };

    useEffect(() => {
      if (!loading && !isAuthenticated()) {
        navigate("/auth");
      }
    }, [loading, navigate]);

    if (loading) {
      return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
    }

    if (!isAuthenticated()) return null;

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
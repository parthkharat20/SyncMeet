import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const { loading } = useAuth();

    const isAuthenticated = () => {
      return !!localStorage.getItem("token");
    };

    useEffect(() => {
      if (!loading && !isAuthenticated()) {
        navigate("/auth");
      }
    }, [loading, navigate]);

    if (loading) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "#94A3B8" }}>
          Loading session...
        </div>
      );
    }

    if (!isAuthenticated()) return null;

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
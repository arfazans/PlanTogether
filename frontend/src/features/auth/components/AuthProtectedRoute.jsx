import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const URL = "http://localhost:9860";

const AuthProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${URL}/user/check-auth`, { withCredentials: true });
        if (res.status === 200) {
          setIsAuthorized(true);
        } else {
          alert("Unauthorized Access");
          setIsAuthorized(false);
        }
      } catch {
        alert("Unauthorized Access");
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthProtectedRoute;
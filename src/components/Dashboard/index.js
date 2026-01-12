import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Home from "./home";
import Login from "../Login";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });

    // cleanup listener when component unmounts
    return () => unsubscribe();
  }, [auth]);

  return (
    <div>
      {user ? <Home /> : <Login />}
    </div>
  );
};

export default Dashboard;

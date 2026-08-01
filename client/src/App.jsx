import React, { useEffect } from "react";
import Home from "./pages/home/Home";
import Auth from "./pages/auth/Auth";
import { Routes, Route, Navigate } from "react-router-dom";
import { getCurrUser } from "./services/api";
import { useDispatch, useSelector } from "react-redux";
import History from "./pages/History";
import Notes from "./pages/Notes";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PomodoroTimer from "./components/PomodoroTimer";
import Review from "./pages/Review";
import Workspace from "./pages/Workspace";
import Explore from "./pages/Explore";

export const serverURL = "http://localhost:4000";

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    getCurrUser(dispatch);

    const handleCreditsUpdate = (e) => {
      import("./redux/userSlice").then(module => {
        dispatch(module.updateCredits(e.detail.credits));
      });
    };
    window.addEventListener('creditsUpdated', handleCreditsUpdate);
    
    return () => {
      window.removeEventListener('creditsUpdated', handleCreditsUpdate);
    };
  }, [dispatch]);

  const { userData } = useSelector((state) => state.user);
  
  return (
    <>
      {userData && <PomodoroTimer />}
      <Routes>
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/auth" replace /> }
        />
        <Route
          path="/auth"
          element={userData ? <Navigate to="/" replace /> : <Auth />}
        />

        <Route
          path="/history"
          element={userData ? <History /> : <Navigate to="/auth" replace /> }
        />
        <Route
          path="/notes"
          element={userData ? <Notes/> : <Navigate to="/auth" replace /> }
        />
        <Route
          path="/workspace"
          element={userData ? <Workspace/> : <Navigate to="/auth" replace /> }
        />
        <Route
          path="/explore"
          element={userData ? <Explore/> : <Navigate to="/auth" replace /> }
        />
        <Route
          path="/review"
          element={userData ? <Review /> : <Navigate to="/auth" replace /> }
        />
        <Route
          path="/pricing"
          element={userData ? <Pricing /> : <Navigate to="/auth" replace /> }
        />

        <Route path='/payment-success' element={<PaymentSuccess/>} />
        <Route path='/payment-failed' element={<PaymentFailed/>} />
      </Routes>
    </>
  );
}

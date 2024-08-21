import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useLoadingWithRefresh } from './hooks/useLoadingWithRefresh';
import Loader from './components/shared/Loader/Loader';

// const isAuth = false; // Replace with actual authentication check
// const user = {
//   activated: false // Replace with actual activation check
// };


function App() {
  //call refresh endpoint
  const {loading}=useLoadingWithRefresh();
  return  loading?(<Loader message="Loading please wait!"/>):(
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
        <Route path="/authenticate" element={<GuestRoute><Authenticate /></GuestRoute>} />
        <Route path="/activate" element={<SemiProtectedRoute><Activate /></SemiProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

const GuestRoute = ({ children }) => {
  const {isAuth}=useSelector((state)=>state.auth);
  return isAuth ? (
    <Navigate to="/rooms" replace />
  ) : (
    children
  );
};

//logged in but not activated
const SemiProtectedRoute = ({ children }) => {
  const {user,isAuth}=useSelector((state)=>state.auth);
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  if (isAuth && !user.activated) {
    return children;
  }

  return <Navigate to="/rooms" replace />;
};

const ProtectedRoute = ({ children }) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  
  // Check if the user is authenticated
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  // Check if the user is authenticated but not activated
  if (isAuth && !user.activated) {
    return <Navigate to="/activate" replace />;
  }

  // If authenticated and activated, allow access to the protected route
  return children;
};

export default App;

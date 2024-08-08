import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import { useSelector } from 'react-redux';
// const isAuth = false; // Replace with actual authentication check
// const user = {
//   activated: false // Replace with actual activation check
// };


function App() {
  return (
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
  const {user,isAuth}=useSelector((state)=>state.auth);
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  if (isAuth && (!user && !user.activated)) {
    return <Navigate to="/activate" replace />;
  }

  return children;
};
export default App;

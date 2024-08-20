import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Navigation.module.css'
import { logout } from '../../../http';
import { setAuth } from '../../../store/authSlice';
import { useDispatch } from 'react-redux';
const Navigation = () => {
    const brandStyle={
        color:'#fff',
        textDecoration:'none',
        fontWeight:'bold',
        fontSize:'22px',
        display:'flex',
        alignItems:'center',
    };
    const logoText={
        marginLeft:'10px',
    }
    const dispatch=useDispatch()
    async function logoutUser(){
      try {
        const {data}=await logout();
        dispatch(setAuth(data))
      } catch (error) {
        console.log(error);
        
      }
    }
  return (
    <nav className={`${styles.navbar} container`}>
       <Link style={brandStyle} to="/">
        <img src='/images/logo.png' alt='logo'/>
        <span style={logoText}>CodeChat!</span>
       </Link> 
       <button onClick={logoutUser}>Logout</button>
    </nav>
  )
}

export default Navigation

import React, { useEffect, useState } from 'react'
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './StepAvatar.module.css';
import {useSelector, useDispatch} from 'react-redux';
import {setAvatar} from '../../../store/activateSlice';
import { activate } from '../../../http';
import {setAuth} from '../../../store/authSlice';
import Loader from '../../../components/shared/Loader/Loader';
const StepAvatar = ({onNext}) => {
  const dispatch=useDispatch();
  const {name,avatar}=useSelector((state)=>state.activate);
  const [image,setImage]=useState('/images/monkey-avatar.png');
  const[loading,setLoading]=useState(false);
  const [unmounted,setUnmounted]=useState(false);
  function captureImage(e){
    const file=e.target.files[0];
    const reader=new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend=function(){
      setImage(reader.result);
      dispatch(setAvatar(reader.result));
    }
  }
  async function submit() {
    setLoading(true);
    try {
        console.log("Submitting data:", { name, avatar });
        const { data } = await activate({ name, avatar });
        console.log("Activation response:", data);

        if (data.auth) {
          if(!unmounted){dispatch(setAuth(data));
            if (onNext) {
                onNext();}
            
            }
        } else {
            console.error("Activation failed:", data.message);
        }
    } catch (error) {
        // console.error("Activation error:", error.response ? error.response.data : error.message);
        console.log(error)
    } finally{
      setLoading(false);
    }
}

useEffect(()=>{
  return()=>{
    setUnmounted(true);
  }
},[]);

if (loading) return <Loader message="Activation in progress..."/>;
  return (
    <>
      <Card title={`Okay, ${name}`}
                    icon="monkey-emoji"
                >
                <p className={styles.subHeading}>How's this photo?</p>
                  <div className={styles.avatarWrapper}>
                    <img src={image} alt="avatar"/>
                  </div>
                    <div>
                      <input onChange={captureImage} id='avatarInput' type='file' className={styles.avatarInput}/>
                      <label className={styles.avatarLabel} htmlFor="avatarInput">Choose a different photo</label>
                    </div>
                   
                    <div className={styles.actionButtonWrap}>
                        <Button onClick={submit} text="Next" />
                    </div>
                </Card>
    </>
  )
}

export default StepAvatar

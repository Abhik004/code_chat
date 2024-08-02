import React, { useState } from 'react'
import Card from '../../../components/shared/Card/Card'
import TextInput from '../../../components/shared/TextInput/TextInput'
import Button from '../../../components/shared/Button/Button'
import styles from './StepOtp.module.css';

const StepOtp = ({onNext}) => {
  const [otp,setOtp]=useState('');
  function next(){}
  return (
    <>
      <div className={styles.cardWrapper}>
        <Card
        title="Enter the code:"
        icon="lock-emoji">
          <TextInput
          value={otp}
          onChange={(e)=>StepOtp(e.target.value)}/>
          <div className={styles.actionButtonWrap}>
            <Button onClick={next} text="Next"/>
          </div>

        </Card>
      </div>
    </>
  )
}

export default StepOtp

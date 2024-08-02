import React, { useState } from 'react'
import Card from '../../../../components/shared/Card/Card'
import Button from '../../../../components/shared/Button/Button'
import TextInput from '../../../../components/shared/TextInput/TextInput'
import styles from '../StepPhoneEmail.module.css'
const Email = ({onnext}) => {
    const[email,setEmail]=useState('');
  return (
    <Card title="Enter your Email id" icon="email-emoji">
        <TextInput value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <div>
        <div className={styles.actionButtonWrap}>
          <Button text="Next" onClick={onnext}/>
          </div>
          <p className={styles.bottomParagraph}>By entering your email, you're agreeing to our Terms of Service and Policy</p>
        </div>
    </Card>
  )
}

export default Email

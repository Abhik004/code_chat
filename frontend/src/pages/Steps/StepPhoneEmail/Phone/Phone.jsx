import React, { useState } from 'react';
import Card from '../../../../components/shared/Card/Card';
import Button from '../../../../components/shared/Button/Button';
import TextInput from '../../../../components/shared/TextInput/TextInput';
import styles from '../StepPhoneEmail.module.css';
import { sendOtp } from '../../../../http/index';

const Phone = ({ onNext }) => { // Corrected prop name
  const [phoneNumber, setPhoneNumber] = useState('');


  async function submit(){
    const res=await sendOtp({phone:phoneNumber});
    onNext();
  }
  return (
    <Card title="Enter your Phone Number" icon="phone">
      <TextInput value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      <div>
        <div className={styles.actionButtonWrap}>
          <Button text="Next" onClick={submit} /> {/* Correctly calling onNext */}
        </div>
        <p className={styles.bottomParagraph}>
          By entering your number, you're agreeing to our Terms of Service and Policy
        </p>
      </div>
    </Card>
  );
}

export default Phone;

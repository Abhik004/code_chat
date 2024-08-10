import React from 'react'
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from '../StepName/StepName.module.css';

const StepAvatar = ({onNext}) => {
  function submit(){}
  return (
    <>
      <Card title="What's your full name?"
                    icon="goggle-emoji"
                >
                    
                    
                   
                    <div className={styles.actionButtonWrap}>
                        <Button onClick={submit} text="Next" />
                    </div>
                </Card>
    </>
  )
}

export default StepAvatar

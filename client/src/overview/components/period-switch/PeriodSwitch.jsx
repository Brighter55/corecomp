import React from 'react'
import styles from "./PeriodSwitch.module.css"

function Switch(props) {
  function handleToggle(event) {
    if (props.period == "quarterly") {
      props.setPeriod("annually");
    } else {
      props.setPeriod("quarterly");
    }
  }

  return (
    <>
      <label className={styles.switch}>
        <input onChange={handleToggle} type="checkbox" defaultChecked />
      </label>
    </>
  );
}

export default Switch;

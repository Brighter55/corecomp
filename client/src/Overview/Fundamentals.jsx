import styles from "./Overview.module.css"


function Fundamentals({style}) {
    return (
        <div className={styles.fundamentals} style={style}>
            <div className={styles.fundamentalTopics}>
                <h2>Core Metrics</h2>
                <div className={styles.fundamentalContent}>
                    <div className={styles.fundamental}>
                        <h3>PE</h3>
                        <h3>37</h3>
                    </div>
                    <div className={styles.fundamental}>
                        <h3>Market Cap</h3>
                        <h3>3.80T <span style={{fontSize: "13px"}}>USD</span></h3>
                    </div>
                    <div className={styles.fundamental}>
                        <h3>Dividend Yeild</h3>
                        <h3>0.71%</h3>
                    </div>
                </div>
            </div>
            <hr />
            <div className={styles.fundamentalTopics}>
                <h2>Financials</h2>
                <div className={styles.fundamentalContent}>
                    <div className={styles.fundamental}>
                        <h3>Cash</h3>
                        <h3>100 B <span style={{fontSize: "13px"}}>USD</span></h3>
                    </div>
                    <div className={styles.fundamental}>
                        <h3>Debt</h3>
                        <h3>50 B <span style={{fontSize: "13px"}}>USD</span></h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Fundamentals

import logo from "../../../../assets/logoDarkMode.png"
import styles from "./Brand.module.css"

function Brand() {
    return (
        <div className={styles.brand}>
            <img src={logo} alt="logo" className={styles.logo} />
            <a href="/" className={styles.brandText}>CoreComp</a>
        </div>
    )
}


export default Brand

import styles from "./AppHeader.module.css"

function AppHeader() {

    return (
        <header className={styles.header}>
            <a href="/overview" className={styles.brand} >CoreComp</a>
        </header>
    )
}

export default AppHeader

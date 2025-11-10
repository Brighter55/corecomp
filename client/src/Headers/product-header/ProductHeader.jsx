import styles from "./ProductHeader.module.css"
import logo from "../../assets/logoDarkMode.png"
import Features from "./Features/Features.jsx"
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';

function ProductHeader() {

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.brand}>
                    <img src={logo} alt="logo" className={styles.logo} />
                    <a href="/overview" className={styles.brandText}>CoreComp</a>
                </div>
                <Features></Features>
                <div className={styles.rightNav}>
                    <Button sx={{ "&:hover": {backgroundColor: "#dce0e8"}, borderRadius: "10px" }} ><SettingsIcon sx={{ color: "#47546b" }} /></Button>
                    <Button
                        sx={{
                            color: "#47546b",
                            fontFamily: "'Segoe Ui', Arial, sans-serif",
                            borderRadius: "10px",
                            "&:hover": {backgroundColor: "#dce0e8"},
                        }}>Log out</Button>
                </div>
            </nav>
        </header>
    );
}

export default ProductHeader;

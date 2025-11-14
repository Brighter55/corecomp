import styles from "./LandingHeader.module.css"
import logo from "../../assets/logoDarkMode.png"
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

function LandingHeader() {
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.brand}>
                    <img src={logo} alt="logo" className={styles.logo} />
                    <a href="/" className={styles.brandText}>CoreComp</a>
                </div>
                    <div className={styles.about}>
                    <Button sx={{ "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"}, borderRadius: "10px", color: "grey"}} ><a href="#features" className={styles.sectionAnchor}>features</a></Button>
                    <Button sx={{ "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"}, borderRadius: "10px", color: "grey"}} ><a href="#products" className={styles.sectionAnchor}>products</a></Button>
                    <Button sx={{ "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"}, borderRadius: "10px", color: "grey"}} ><a href="#pricing" className={styles.sectionAnchor}>pricing</a></Button>
                </div>
                <div className={styles.rightNav}>
                    <Button
                    onClick={() => {navigate("/sign-in")}}
                    sx={{   "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"},
                            borderRadius: "10px",
                            color: "grey"}}
                    >Sign in</Button>
                    <Button
                        onClick={() => {navigate("/sign-up")}}
                        sx={{
                            color: "black",
                            fontFamily: "'Segoe Ui', Arial, sans-serif",
                            borderRadius: "10px",
                            "&:hover": {backgroundColor: "lightgrey"},
                            backgroundColor: "#DAD7CD",
                        }}>Sign Up</Button>
                </div>
            </nav>
        </header>
    );
}

export default LandingHeader;

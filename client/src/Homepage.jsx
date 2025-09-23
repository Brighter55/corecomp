import {useNavigate} from "react-router-dom"


function Homepage() {
    const navigate = useNavigate();

    function handleTryClicked(event) {
        event.preventDefault();
        navigate("/sign-up");
    }

    return (
        <div>
            <header>
                <a href="#home">CoreComp</a>
                <nav>
                    <a href="#features" >Features</a>
                    <a href="#demo" >Demo</a>
                    <a href="/sign-in">Sign in</a>
                </nav>
            </header>
            <section id="home">
                <button onClick={handleTryClicked}>Try it</button>
            </section>
            <section id="features">
                <h2>TO DO features</h2>
            </section>
            <section id="demo">
                <h2>TO DO demo</h2>
            </section>
            <footer>
                <h2>TO DO footer</h2>
            </footer>
        </div>
    )
}

export default Homepage

import Slide from '@mui/material/Slide';
import useScrollTrigger from '@mui/material/useScrollTrigger';

function HideOnScroll(props) {
    const { children } = props;
    const trigger = useScrollTrigger({
        target: typeof window !== 'undefined' ? window : undefined,
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}


export default HideOnScroll

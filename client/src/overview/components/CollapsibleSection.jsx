import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';

const ExpandMoreIconStyled = styled(ExpandMoreIcon)(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

function CollapsibleSection({ title, children, defaultExpanded = true }) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover": {
                        opacity: 0.8,
                    }
                }}
                onClick={handleExpandClick}
            >
                <Typography variant="h4">{title}</Typography>
                <IconButton
                    size="small"
                    sx={{ marginLeft: "auto" }}
                    onClick={handleExpandClick}
                >
                    <ExpandMoreIconStyled expand={expanded} sx={{color: "var(--main-dust-grey)"}}/>
                </IconButton>
            </Stack>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                {children}
            </Collapse>
        </Stack>
    );
}

export default CollapsibleSection;

// mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
function About() {

    return (
        <Stack spacing={2}>
            <Typography variant="h4">About</Typography>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "white" }}/> }
            >
                <Stack sx={{ flex: 1 }}>
                    <Typography variant="h6">Sector</Typography>
                    <Typography variant="body1">
                        Technology Service
                    </Typography>
                </Stack>
                <Stack sx={{ flex: 1 }}>
                    <Typography variant="h6">Industry</Typography>
                    <Typography variant="body1">
                        Packaged Software
                    </Typography>
                </Stack>
                <Stack sx={{ flex: 1 }}>
                    <Typography variant="h6">CEO</Typography>
                    <Typography variant="body1">
                        Satya Nadella
                    </Typography>
                </Stack>
                <Stack sx={{ flex: 1 }}>
                    <Typography variant="h6">Founded</Typography>
                    <Typography variant="body1">
                        1975
                    </Typography>
                </Stack>
            </Stack>
            <Typography variant="body1">
                Microsoft Corp engages in the development and support of software, services, devices, and solutions. It operates through the following business segments: Productivity and Business Processes; Intelligent Cloud; and More Personal Computing. The Productivity and Business Processes segment comprises products and services in the portfolio of productivity, communication, and information services of the company spanning a variety of devices and platform. The Intelligent Cloud segment refers to the public, private, and hybrid serve products and cloud services of the company which can power modern business. The More Personal Computing segment encompasses products and services geared towards the interests of end users, developers, and IT professionals across all devices. The firm also offers operating systems; cross-device productivity applications; server applications; business solution applications; desktop and server management tools; software development tools; video games; personal computers, tablets; gaming and entertainment consoles; other intelligent devices; and related accessories. The company was founded by Paul Gardner Allen and William Henry Gates III in 1975 and is headquartered in Redmond, WA.
            </Typography>
        </Stack>
    )
}

export default About

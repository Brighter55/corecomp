import {Rectangle} from "recharts"

function CustomBar(props) {
    const barColor = (props.value >= 0 ? "#588157" : "#bc4749");
    return <Rectangle {...props} fill={barColor}/>
}

export default CustomBar

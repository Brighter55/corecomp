import {Rectangle} from "recharts"

function CustomActiveBar(props) {
    const activeBarColor = (props.value >= 0 ? "#588157" : "#a33d3e");
    return <Rectangle {...props} fill={activeBarColor} stroke="#DAD7CD"></Rectangle>
}

export default CustomActiveBar

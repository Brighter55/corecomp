import {Rectangle} from "recharts"

function CustomActiveBar(props) {
    const activeBarColor = (props.value >= 0 ? "#A3B18A" : "#B35C5E");
    return <Rectangle {...props} fill={activeBarColor} stroke="#DAD7CD"></Rectangle>
}

export default CustomActiveBar

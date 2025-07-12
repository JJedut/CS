import React from "react";
import styles from "./../modules/SwitchButton.module.css";

type Props = {
    selected: boolean;
    onSelect: (side: boolean) => void;
    leftLabel?: string;
    rightLabel?: string;
}

const SwitchButton: React.FC<Props> = ({ selected, onSelect, leftLabel, rightLabel }) => {

    return (
        <div className={styles.switchContainer}>
            <button
                className={selected ? styles.selected : styles.unselected}
                onClick={() => onSelect(true)}>
                {leftLabel}
            </button>
            <button
                className={!selected ? styles.selected : styles.unselected}
                onClick={() => onSelect(false)}>
                {rightLabel}
            </button>
        </div>
    )
}

export default SwitchButton;
import React from 'react';
import styles from '../modules/Popup.module.css';
import ReactDOM from 'react-dom';

interface PopupProps {
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ show, onClose, children }) => {
    if (!show) return null;

    return ReactDOM.createPortal(
        <div className={styles.popupOverlay} onClick={onClose}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Popup;
import {useState} from "react";
import styles from './modules/MainPanel.module.css';
import SteamUserList from "./SteamUserList.tsx";
import type {SteamUser} from "../types/SteamUser.ts";
import TeamRandomizer from "./TeamRandomizer.tsx";

const MainPanel: React.FC = () => {
    const [selectedUsers, setSelectedUsers] = useState<SteamUser[]>([]);

    return (
        <div className={styles.mainPanel}>
            <div className={styles.leftPanel}>
                <SteamUserList onSelectionChange={setSelectedUsers} />
            </div>
            <div className={styles.rightPanel}>
                <TeamRandomizer users={selectedUsers} />
            </div>
        </div>
    )
}

export default MainPanel;
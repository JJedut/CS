import {useState} from "react";
import styles from './modules/MainPanel.module.css';
import SteamUserList from "./SteamUserList.tsx";
import type {SteamUser} from "../types/SteamUser.ts";
import TeamRandomizer from "./TeamRandomizer.tsx";
import SwitchButton from "./atoms/SwitchButton.tsx";
import MapRandomizer from "./MapRandomizer.tsx";
import { AnimatePresence, motion } from "framer-motion";

const MainPanel: React.FC = () => {
    const [selectedUsers, setSelectedUsers] = useState<SteamUser[]>([]);
    const [selectedSide, setSelectedSide] = useState(true);

    return (
        <div className={styles.mainPanel}>
            <div className={styles.leftPanel}>
                <SteamUserList onSelectionChange={setSelectedUsers} />
            </div>
            <div className={styles.rightPanel}>
                <div className={styles.rightPanelContainer}>
                    <div className={styles.switchContainer}>
                        <SwitchButton
                            selected={selectedSide}
                            onSelect={(side) => setSelectedSide(side)}
                            leftLabel={"Team"}
                            rightLabel={"Map"}
                        />
                    </div>

                    <div style={{ position: "relative" }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                animate={{
                                    opacity: selectedSide ? 1 : 0,
                                    y: selectedSide ? 0 : -10,
                                    filter: selectedSide ? "blur(0px)" : "blur(10px)"
                                }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    display: selectedSide ? "block" : "none", // Optional: prevents interaction
                                    position: "absolute",
                                    width: "100%",
                                }}
                            >
                                <TeamRandomizer users={selectedUsers} />
                            </motion.div>

                            <motion.div
                                animate={{
                                    opacity: !selectedSide ? 1 : 0,
                                    y: !selectedSide ? 0 : -10,
                                    filter: !selectedSide ? "blur(0px)" : "blur(10px)"
                                }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    display: !selectedSide ? "block" : "none",
                                    position: "absolute",
                                    width: "100%",
                                }}
                            >
                                <MapRandomizer />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default MainPanel;
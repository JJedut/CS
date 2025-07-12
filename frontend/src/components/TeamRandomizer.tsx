import React, { useEffect, useRef, useState } from "react";
import styles from "./modules/TeamRandomizer.module.css";
import type { SteamUser } from "../types/SteamUser.ts";

type Props = {
    users: SteamUser[];
};

const TeamRandomizer: React.FC<Props> = ({ users }) => {
    const [teamA, setTeamA] = useState<SteamUser[]>([]);
    const [teamB, setTeamB] = useState<SteamUser[]>([]);
    const [remainingUsers, setRemainingUsers] = useState<SteamUser[]>([]);
    const [lastAssigned, setLastAssigned] = useState<SteamUser | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [currentOffset, setCurrentOffset] = useState(0);
    const [locked, setLocked] = useState<boolean>(false);

    const reelRef = useRef<HTMLDivElement>(null);
    const reelWindowRef = useRef<HTMLDivElement>(null);

    const ITEM_WIDTH = 64 + 8; // avatar + margin

    // Sync remaining users on load
    useEffect(() => {
        setTeamA([]);
        setTeamB([]);
        setRemainingUsers(users);
        setLastAssigned(null);
        setCurrentOffset(0);

        if (reelRef.current) {
            reelRef.current.style.transition = 'none';
            reelRef.current.style.transform = 'translateX(0px)';
        }
    }, [users]);

    const handleSpin = () => {
        if (spinning || remainingUsers.length === 0) return;

        let updatedRemaining = [...remainingUsers];

        if (lastAssigned) {
            updatedRemaining = updatedRemaining.filter(
                (u) => u.steamid !== lastAssigned.steamid
            );
        }

        if (updatedRemaining.length === 0) return;

        const repeats = Math.max(6, Math.ceil(500 / updatedRemaining.length));
        const fullReel = Array.from({ length: repeats * updatedRemaining.length }, (_, i) => {
            return updatedRemaining[i % updatedRemaining.length];
        });

        const middleIndex = Math.floor(fullReel.length / 2);
        const targetIndex = middleIndex + Math.floor(Math.random() * updatedRemaining.length);
        const selectedUser = fullReel[targetIndex]; // This is now determined by reel location

        const reelWindowWidth = reelWindowRef.current?.offsetWidth || 0;
        const targetOffset = targetIndex * ITEM_WIDTH;
        const avatarRandOffset = Math.random() * ITEM_WIDTH;
        const newOffset = targetOffset - reelWindowWidth / 2 + avatarRandOffset;

        setRemainingUsers(updatedRemaining);
        setSpinning(true);

        if (reelRef.current) {
            reelRef.current.style.transition = "none";
            reelRef.current.style.transform = `translateX(0px)`;

            requestAnimationFrame(() => {
                if (!reelRef.current) return;
                reelRef.current.style.transition = "transform 5s cubic-bezier(0.15, 0.85, 0.25, 1)";
                reelRef.current.style.transform = `translateX(-${newOffset}px)`;
            });
        }

        const audio = new Audio("../../public/sounds/audiomass-output2.wav");
        const endAudio = new Audio("../../public/sounds/gun-hammer-click.wav");

        const TICK_INTERVAL_START = 10; // ms between ticks at the beginning
        const TICK_INTERVAL_END = 180;  // ms between ticks at the end
        const TICK_COUNT = 30;

        for (let i = 0; i < TICK_COUNT; i++) {
            const progress = i / TICK_COUNT;
            const interval = TICK_INTERVAL_START + (TICK_INTERVAL_END - TICK_INTERVAL_START) * progress;

            setTimeout(() => {
                audio.currentTime = 0;
                audio.play();
            }, interval * i);
        }

        // Use selectedUser AFTER animation, not before
        setTimeout(() => {
            const isTeamA = teamA.length <= teamB.length;
            if (isTeamA) setTeamA((prev) => [...prev, selectedUser]);
            else setTeamB((prev) => [...prev, selectedUser]);

            const nextRemaining = updatedRemaining.filter(u => u.steamid !== selectedUser.steamid);

            setLastAssigned(selectedUser);
            setCurrentOffset(newOffset);

            if (nextRemaining.length === 1) {
                const lastUser = nextRemaining[0];
                const toTeamA = teamA.length + (isTeamA ? 1 : 0) <= teamB.length + (isTeamA ? 0 : 1);
                if (toTeamA) setTeamA((prev) => [...prev, lastUser]);
                else setTeamB((prev) => [...prev, lastUser]);

                //setRemainingUsers([]);
                setLastAssigned(lastUser);
                setLocked(true);
            } else {
                //setRemainingUsers(nextRemaining);
            }

            setSpinning(false);
            endAudio.play()
        }, 5100);
    };


    const usersForReel = remainingUsers;

    const repeats = Math.max(6, Math.ceil(500 / usersForReel.length));
    const fullReel = Array.from({ length: repeats * usersForReel.length }, (_, i) => {
        return usersForReel[i % usersForReel.length];
    });

    const handleReset = () => {
        setTeamA([]);
        setTeamB([]);
        setRemainingUsers(users);
        setLastAssigned(null);
        setCurrentOffset(0);
        setLocked(false);
        if (reelRef.current) {
            reelRef.current.style.transition = "none";
            reelRef.current.style.transform = `translateX(0px)`;
        }
    };

    const allAssigned = users.length > 0 && teamA.length > 0 || teamB.length > 0;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Team Randomizer</h1>

            {fullReel.length > 0 && (
                <>
                    <div className={styles.reelWrapper}>
                        <div className={styles.reelWindow} ref={reelWindowRef}>
                            <div className={styles.reel} ref={reelRef}>
                                {fullReel.map((user, i) => (
                                    <div key={`${user.steamid}-${i}`} className={styles.userSlot}>
                                        <img
                                            src={user.avatar}
                                            alt={user.nickname}
                                            className={styles.avatar}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className={styles.reticle}></div>
                        </div>
                    </div>

                    <button
                        className={styles.spinButton}
                        onClick={handleSpin}
                        disabled={spinning || locked}
                    >
                        {spinning ? "..." : "Draw Next Player"}
                    </button>
                </>
            )}

            {fullReel.length == 0 && (
                <>
                    <h3>Select friends from the list to include them in the draw.</h3>
                </>
            )}

            <div className={styles.teams}>
                {teamA.length > 0 && (
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <h2 className={styles.teamTitle}>Team A</h2>
                        <div className={`${styles.teamBase} ${styles.teamA}`}>
                            {teamA.map((user) => (
                                <div key={user.steamid} className={styles.user}>
                                    <img src={user.avatar} className={styles.avatar}/>
                                    <strong>{user.nickname}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {teamB.length > 0 && (
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <h2 className={styles.teamTitle}>Team B</h2>
                        <div className={`${styles.teamBase} ${styles.teamB}`}>
                            {teamB.map((user) => (
                                <div key={user.steamid} className={styles.user}>
                                    <img src={user.avatar} className={styles.avatar}/>
                                    <strong>{user.nickname}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {lastAssigned && (
                <div className={styles.assignment}>
                    <strong>{lastAssigned.nickname}</strong> was assigned to{" "}
                    {teamA.includes(lastAssigned) ? "Team A" : "Team B"}!
                </div>
            )}
            {allAssigned && (
                <button
                    onClick={handleReset}
                >
                    Reset Teams
                </button>
            )}
        </div>
    );
};

export default TeamRandomizer;

import React, { useState, useEffect } from 'react';
import styles from './modules/SteamUserList.module.css';
import Popup from "./atoms/Popup.tsx";
import ExportJSONButton from "./atoms/ExportJSON.tsx";
import ImportJSON from "./atoms/ImportJSON.tsx";
import DeleteIcon from "./icons/DeleteIcon.tsx";
import type {SteamUser} from "../types/SteamUser.ts";
import UserPlusIcon from "./icons/UserPlusIcon.tsx";

type AddSteamUserProps = {
    onSelectionChange?: (selectedIds: SteamUser[]) => void;
};

const LOCAL_STORAGE_KEY = 'steamUsers';

const SteamUserList: React.FC<AddSteamUserProps> = ({ onSelectionChange }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupFriends, setShowPopupFriends] = useState(false);
    const [previewUser, setPreviewUser] = useState<SteamUser | null>(null);

    const [users, setUsers] = useState<SteamUser[]>(() => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            console.warn('Invalid local storage data for Steam users');
            return [];
        }
    });

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                setUsers(JSON.parse(stored));
            } catch {
                console.warn('Invalid local storage data for Steam users');
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
    }, [users]);

    const handleAddUser = async () => {
        setError(null);
        setPreviewUser(null);

        try {
            let steamId = input.trim();

            const steamUrlPattern = /steamcommunity\.com\/(id|profiles)\/([^/?#]+)/i;
            const match = steamId.match(steamUrlPattern);
            if (match) {
                steamId = match[2];
            }

            const isSteamID = /^\d{17}$/.test(steamId);

            if (!isSteamID) {
                const resolveRes = await fetch(`/api/resolve/${encodeURIComponent(steamId)}`);
                const resolveData = await resolveRes.json();

                if (resolveData.response.success !== 1) {
                    throw new Error('Could not resolve Steam username');
                }

                steamId = resolveData.response.steamid;
            }

            if (users.some(user => user.steamid === steamId)) {
                throw new Error('User already added');
            }

            const userRes = await fetch(`/api/player/${steamId}`);
            const userData = await userRes.json();

            if (!userRes.ok) {
                throw new Error(userData.error || 'Failed to fetch user');
            }

            const newUser: SteamUser = {
                steamid: userData.steamid,
                nickname: userData.nickname,
                avatar: userData.avatar,
            };

            setPreviewUser(newUser);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'Something went wrong');
            } else {
                console.error("An unexpected error type occurred:", err);
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!input.trim()) {
            setPreviewUser(null);
            return;
        }

        const timeout = setTimeout(() => {
            handleAddUser();
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeout); // Cleanup on input change
    }, [input]);

    const handleAcceptUser = () => {
        if (!previewUser) return;
        setUsers([...users, previewUser]);
        setPreviewUser(null);
        setInput('');
    };

    const handleRemoveUser = (steamid: string) => {
        setUsers(users.filter(user => user.steamid !== steamid));
    };

    const toggleSelect = (steamid: string, index: number, event: React.MouseEvent) => {
        setSelectedIds(prev => {
            let newSelected: string[];

            if (event.shiftKey && lastSelectedId !== null) {
                const start = Math.min(lastSelectedId, index);
                const end = Math.max(lastSelectedId, index);

                const rangeUsers = users
                    .slice(start, end + 1);
                const selectedSet = new Set(prev);

                for (let i = 0; i < rangeUsers.length; i++) {
                    const userIndex = start + i;
                    const id = rangeUsers[i].steamid;

                    if (userIndex === lastSelectedId) continue;

                    if (selectedSet.has(id)) {
                        selectedSet.delete(id);
                    } else {
                        selectedSet.add(id);
                    }
                }

                newSelected = Array.from(selectedSet);
            } else {
                newSelected = prev.includes(steamid)
                    ? prev.filter(id => id !== steamid)
                    : [...prev, steamid];
            }

            setLastSelectedId(index);

            onSelectionChange?.(users.filter(user => newSelected.includes(user.steamid)));

            return newSelected;
        });
    };

    return (
        <div className={styles.friendList}>
            <div className={styles.friends}>
                <div className={styles.titleContainer}>
                    <div className={styles.friendsTitle}>
                        Friends
                        <div>
                            {selectedIds.length > 0 && (
                                <span className={styles.userNum}>{selectedIds.length}/</span>
                            )}
                            {users.length}
                        </div>
                    </div>
                    <button className="accent" onClick={() => setShowPopupFriends(true)}>
                        <UserPlusIcon />
                    </button>
                </div>

                <div className={styles.list}>
                    {users.map((user, index) => {
                        const isSelected = selectedIds.includes(user.steamid);

                        return (
                            <div
                                key={user.steamid}
                                className={`${styles.user} ${isSelected ? styles.selected : ''}`}
                            >
                                <div
                                    onClick={(e) => toggleSelect(user.steamid, index, e)}
                                    style={{display: 'flex', gap: '0.5rem', padding: '0.5rem', width: "100%"}}>
                                    <img
                                        src={user.avatar}
                                        alt={user.nickname}
                                        className={styles.avatar}
                                    />
                                    <div style={{flexGrow: 1}}>
                                        <strong>{user.nickname}</strong>
                                        <p style={{margin: 0, fontSize: '0.8rem', opacity: '0.6'}}>{user.steamid}</p>
                                    </div>
                                </div>
                                <div className={styles.userButtons}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() =>
                                            window.open(`https://steamcommunity.com/profiles/${user.steamid}`, '_blank')}>
                                        <div className={styles.steamIcon}/>
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => handleRemoveUser(user.steamid)}>
                                        <DeleteIcon className={styles.icon}/>
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {users.length === 0 && (
                        <div className={styles.sadContainer}>
                            <div className={styles.sadFaceIcon}/>
                            <h3>You have no friends.</h3>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.buttons}>
                <ExportJSONButton users={users}/>
                <button style={{width: '100%'}} onClick={() => setShowPopup(true)}>
                    Import
                </button>
            </div>

            <Popup show={showPopup} onClose={() => setShowPopup(false)}>
                <ImportJSON
                    users={users}
                    setUsers={setUsers}
                    onClose={() => setShowPopup(false)}
                />
            </Popup>

            <Popup show={showPopupFriends} onClose={() => setShowPopupFriends(false)}>
                <div className={styles.searchFriends}>
                    <input
                        className={styles.friendsInput}
                        placeholder="Steam ID, Vanity URL or User Link"
                        value={input}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInput(value);

                            if (value.trim()) {
                                setIsLoading(true);
                            } else {
                                setIsLoading(false);
                            }
                        }}
                    />
                </div>
                {error && (
                    <div className="error-container">
                        {error}
                    </div>
                )}
                {isLoading && (
                    <div className={styles.loader}>
                        <div className={styles.waveLoader}/>
                        <div className={styles.waveLoaderText}/>
                    </div>
                )}
                {previewUser && (
                    <div className={styles.preview}>
                        <img
                            src={previewUser.avatar}
                            alt={previewUser.nickname}
                            className={styles.avatarPreview}
                        />
                        <strong>{previewUser.nickname}</strong>
                        <button className={styles.accentButton} onClick={() => handleAcceptUser()}>
                            <UserPlusIcon/> Add User
                        </button>
                    </div>
                )}
            </Popup>
        </div>
    );
};

export default SteamUserList;

import React, { useRef, useState } from 'react';
import styles from '../modules/ImportCSV.module.css';
import DeleteIcon from "../icons/DeleteIcon.tsx";
import type {SteamUser} from "../../types/SteamUser.ts";

interface ImportJSONProps {
    users: SteamUser[];
    setUsers: React.Dispatch<React.SetStateAction<SteamUser[]>>;
    onClose: () => void;
    setError: (err: string | null) => void;
}

const ImportJSON: React.FC<ImportJSONProps> = ({
                                                 users,
                                                 setUsers,
                                                 onClose,
                                                 setError,
                                             }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUsers, setPreviewUsers] = useState<SteamUser[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {

                    const existingSteamIds = new Set(users.map((u) => u.steamid));
                    const newUsers = json.filter(
                        (u: SteamUser) => !existingSteamIds.has(u.steamid));

                    if (newUsers.length === 0) {
                        setError("All imported users already exists!");
                    }

                    setPreviewUsers(newUsers);
                } else {
                    console.error("Invalid format: expected array");
                    setError("Invalid JSON format")
                }
            } catch (err) {
                console.error("Invalid JSON: ",err);
                setError("Invalid JSON content")
            }
        };

        reader.readAsText(file);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleAccept = () => {
        setUsers(prev => [...prev, ...previewUsers]);
        setPreviewUsers([]);
        onClose();
    };

    const handleCancel = () => {
        setPreviewUsers([]);
        onClose();
    };

    const handleRemoveUser = (steamid: string) => {
        setPreviewUsers(prev => prev.filter(user => user.steamid !== steamid));
    };

    return (
        <div className={styles.importContainer}>
            {previewUsers.length == 0 && (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={styles.dropZone}
                    style={{
                        background: isDragging ? '#404040' : '#333333'
                    }}
                >
                    <h3>Import Steam Users</h3>

                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleInputChange}
                    />

                    <button onClick={() => fileInputRef.current?.click()}>Add JSON File</button>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Or drop your JSON file here</p>
                </div>
            )}

            {previewUsers.length > 0 && (
                <div style={{ textAlign: 'left' }}>
                    <div style={{ margin: '0.5rem 0' }} className='title'>Users</div>
                    <div className={styles.usersContainer}>
                        {previewUsers.map(user => (
                            <div className={styles.usersCard} key={user.steamid}>
                                <div className={styles.users}>
                                    <img src={user.avatar} alt="" width={75}
                                         style={{verticalAlign: 'middle', borderRadius: '0.25rem'}}/>
                                    <div>
                                        <strong>{user.nickname}</strong>
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
                        ))}
                    </div>

                    <div style={{marginTop: '1rem', display: 'flex', gap: '1.5rem', padding: '0 0.5rem 0.5rem'}}>
                        <button onClick={handleCancel} style={{width: '100%'}}>
                            Cancel
                        </button>
                        <button className="accent" onClick={handleAccept} style={{width: '100%'}}>
                            Import
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportJSON;
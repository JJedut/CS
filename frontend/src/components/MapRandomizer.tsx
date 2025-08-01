import {useRef, useState} from "react";
import styles from "./modules/TeamRandomizer.module.css"
import Popup from "./atoms/Popup.tsx";

type mapType= {
    name: string,
    image: string,
}

const maps: mapType[] = [
    { name: "Ancient", image: "/maps/ancient.jpg"},
    { name: "Anubis", image: "/maps/anubis.jpg"},
    { name: "Dust II", image: "/maps/Dust_2.jpg"},
    { name: "Inferno", image: "/maps/inferno.jpg"},
    { name: "Italy", image: "/maps/Italy.jpg"},
    { name: "Mirage", image: "/maps/mirage.jpg"},
    { name: "Nuke", image: "/maps/nuke.jpg"},
    { name: "Office", image: "/maps/Office.jpg"},
    { name: "Overpass", image: "/maps/overpass.jpg"},
    { name: "Train", image: "/maps/train.jpg"},
    { name: "Vertigo", image: "/maps/vertigo.jpg"},
];

const ITEM_WIDTH = 228 + 8;

const MapRandomizer = () => {
    const [spinning, setSpinning] = useState(false);
    const [selectedMaps, setSelectedMaps] = useState<mapType[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [winnerMap, setWinnerMap] = useState<string>("");

    const reelRef = useRef<HTMLDivElement>(null);
    const reelWindowRef = useRef<HTMLDivElement>(null);

    const availableMaps = selectedMaps.length > 0 ? selectedMaps : maps;

    const repeats = Math.max(6, Math.ceil(500 / availableMaps.length));
    const fullReel = Array.from({ length: availableMaps.length * repeats}, (_, i) => {
        return availableMaps[i % availableMaps.length];
    });

    const handleSpin = () => {
        if (spinning || availableMaps.length === 0) return;

        const middleIndex = Math.floor(fullReel.length / 2);
        const targetIndex = middleIndex + Math.floor(Math.random() * availableMaps.length);
        const targetMap = fullReel[targetIndex];

        const reelWindowWidth = reelWindowRef.current?.offsetWidth || 0;
        const targetOffset = targetIndex * ITEM_WIDTH;
        const mapRandOffset = Math.random() * ITEM_WIDTH;
        const newOffset = targetOffset - reelWindowWidth / 2 + mapRandOffset;

        setSpinning(true);
        setWinnerMap("");

        if (reelRef.current) {
            reelRef.current.style.transition = "none";
            reelRef.current.style.transform = `translateX(0px)`;

            requestAnimationFrame(() => {
                if (!reelRef.current) return;
                reelRef.current.style.transition = "transform 5s cubic-bezier(0.15, 0.85, 0.25, 1)";
                reelRef.current.style.transform = `translateX(-${newOffset}px)`;
            });
        }

        setTimeout(() => {
            setSpinning(false);
            console.log("Selected map: ", targetMap.name);
            setWinnerMap(targetMap.name);
        }, 5100);
    };

    const toggleMapSelection = (map: mapType) => {
        setSelectedMaps(prev => {
            const exists = prev.some(m => m.name === map.name);
            return exists
                ? prev.filter(m => m.name !== map.name)
                : [...prev, map];
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Map Randomizer</h1>

            <div className={styles.reelWrapper}>
                <div className={styles.reelWindow} ref={reelWindowRef}>
                    <div className={styles.reel} ref={reelRef}>
                        {fullReel.map((map, i) => (
                            <div key={`${map.name}-${i}`} className={styles.mapSlot}>
                                <div
                                    style={{
                                        backgroundImage: `url('${map.image}')`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        borderRadius: "0.25rem",
                                        width: "228px",
                                        height: "128px"
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.reticle}></div>
                </div>
            </div>

            <h2>{winnerMap ? winnerMap : '???'}</h2>

            <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", justifyContent: "center" }}>
                <button
                    className={styles.spinButton}
                    onClick={handleSpin}
                    disabled={spinning}
                >
                    {spinning ? "..." : "Draw Map"}
                </button>

                <button
                    onClick={() => setShowPopup(true)}
                    disabled={spinning}
                >
                    Select Maps
                </button>
            </div>

            <Popup show={showPopup} onClose={() => setShowPopup(false)}>
                <div className={styles.mapsContainer}>
                    {maps.map((map, i) => {
                        const isSelected = selectedMaps.some(m => m.name === map.name);
                        return (
                            <div
                                key={`${map.name}-${i}`}
                                onClick={() => toggleMapSelection(map)}
                                className={`${styles.mapBorder} ${isSelected ? styles.selected : ""}`}
                            >
                                <div
                                    className={ styles.mapTile }
                                    style={{
                                        backgroundImage: `url('${map.image}')`
                                    }}
                                >
                                <div className={ styles.mapName }>
                                    {map.name}
                                </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Popup>
        </div>
    );
}

export default MapRandomizer
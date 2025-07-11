import React from 'react';

interface AudioProps {
    volume: number;
    mute: boolean;
}

const AudioSettings: React.FC<AudioProps> = ({ volume, mute }) => {
    return (
        <div></div>
    )
}

export default AudioSettings;
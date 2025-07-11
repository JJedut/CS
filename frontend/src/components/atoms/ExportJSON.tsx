import React from 'react';

interface ExportJSONButtonProps {
    users: { steamid: string }[];
}

const ExportJSONButton: React.FC<ExportJSONButtonProps> = ({ users }) => {
    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(users, null, '\t')], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'steam_users.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            style={{ width: '100%' }}
            onClick={handleExportJSON}
            disabled={users.length === 0}
        >
            Export
        </button>
    );
};

export default ExportJSONButton;
import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

const STEAM_API_BASE = 'https://api.steampowered.com';

app.use(cors());
app.use(express.json());

const requireSteamKey = (req: Request, res: Response, next: NextFunction): void => {
    if (!STEAM_API_KEY) {
        res.status(500).json({ error: 'Steam API key not configured' });
        return;
    }

    next();
};

app.get('/api/resolve/:vanityurl', requireSteamKey, async (req: Request, res: Response) => {
    try {
        const { vanityurl } = req.params;
        const response = await axios.get(`${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/`, {
            params: {
                key: STEAM_API_KEY,
                vanityurl,
                format: 'json',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error resolving vanity URL:', error);
        res.status(500).json({ error: 'Failed to resolve vanity URL' });
    }
});

app.get('/api/player/:steamid', requireSteamKey, async (req: Request, res: Response): Promise<void> => {
    try {
        const { steamid } = req.params;
        const response = await axios.get(`${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/`, {
            params: {
                key: STEAM_API_KEY,
                steamids: steamid,
            },
        });

        const player = response.data.response.players?.[0];

        if (!player) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }

        res.json({
            steamid: player.steamid,
            nickname: player.personaname,
            avatar: player.avatarfull,
        });
    } catch (error) {
        console.error('Error fetching player data:', error);
        res.status(500).json({ error: 'Failed to fetch player data' });
    }
});


app.listen(PORT, () => {
    console.log(`Steam Backend API running on http://localhost:${PORT}`);
});

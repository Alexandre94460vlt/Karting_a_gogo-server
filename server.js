const WebSocket = require('ws');

// Render définit automatiquement la variable d'environnement PORT
const PORT = process.env.PORT || 8080;

// Création du serveur
const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`🚀 Serveur Relais Démarré sur le port ${PORT}`);
});

wss.on('connection', (ws) => {
    console.log("SNC : Nouveau joueur connecté !");

    ws.on('message', (data) => {
        // Conversion du buffer en string pour éviter les problèmes de format
        const message = data.toString();

        // Envoi à tous les autres clients connectés
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('error', (error) => {
        console.error("Erreur WebSocket :", error);
    });

    ws.on('close', () => {
        console.log("Un joueur s'est déconnecté.");
    });
});

// Petit "ping" pour éviter que la connexion ne se coupe trop vite (Keep-alive)
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// 1. Dashboard Endpoint: Totaux et Récence
app.get('/api/dashboard', async (req, res) => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Calcul atterrissages derniers 90 jours
  const recentFlights = await prisma.flight.aggregate({
    where: { date: { gte: ninetyDaysAgo } },
    _sum: { landingsDay: true, landingsNight: true }
  });

  // Totaux par fonction (PIC vs DUAL)
  const totals = await prisma.flight.groupBy({
    by: ['pilotFunction'],
    _sum: { blockTime: true } // en minutes
  });

  // Alertes Licences/Médical
  const today = new Date();
  const expiringLicenses = await prisma.license.findMany({
    where: { expiryDate: { lte: new Date(today.setDate(today.getDate() + 30)) } } // Expire dans < 30 jours
  });

  const totalLandings90 = (recentFlights._sum.landingsDay || 0) + (recentFlights._sum.landingsNight || 0);

  res.json({
    currency: {
      passenger_ready: totalLandings90 >= 3,
      landings_90_days: totalLandings90
    },
    hours: totals, // Retourne un tableau [{ pilotFunction: 'PIC', _sum: { blockTime: 1200 } }]
    alerts: expiringLicenses
  });
});

// CRUD basique pour ajouter un vol (exemple)
app.post('/api/flights', async (req, res) => {
  const { date, aircraftId, duration, landings, func } = req.body;
  // Logique d'insertion ici...
  res.json({ status: 'ok' });
});

// Route pour créer un vol
app.post('/api/flights', async (req, res) => {
  try {
    const { 
      date, departure, arrival, blockTime, 
      pilotFunction, landingsDay, landingsNight, aircraftId 
    } = req.body;

    // Validation simple
    if (!date || !aircraftId || !blockTime) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const newFlight = await prisma.flight.create({
      data: {
        date: new Date(date), // Conversion string -> Date Object
        departure: departure?.toUpperCase() || "",
        arrival: arrival?.toUpperCase() || "",
        blockTime: parseInt(blockTime),
        pilotFunction,
        landingsDay: parseInt(landingsDay),
        landingsNight: parseInt(landingsNight),
        aircraft: {
          connect: { id: parseInt(aircraftId) }
        }
      }
    });

    res.json(newFlight);
  } catch (error) {
    console.error("Erreur création vol:", error);
    res.status(500).json({ error: "Impossible de créer le vol" });
  }
});

// Route pour récupérer les avions (pour la liste déroulante du formulaire)
app.get('/api/aircrafts', async (req, res) => {
  const aircrafts = await prisma.aircraft.findMany();
  res.json(aircrafts);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
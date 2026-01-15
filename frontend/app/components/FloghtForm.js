'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FlightForm() {
  const router = useRouter();
  const [aircraftList, setAircraftList] = useState([]);
  const [loading, setLoading] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut
    aircraftId: '',
    departure: '',     // OACI Départ
    arrival: '',       // OACI Arrivée
    offBlock: '10:00', // Heure départ bloc
    onBlock: '11:00',  // Heure arrivée bloc
    landingsDay: 1,
    landingsNight: 0,
    pilotFunction: 'PIC', // PIC, DUAL, FI
  });

  const [totalTime, setTotalTime] = useState(60); // En minutes

  // 1. Charger la liste des avions au montage
  useEffect(() => {
    // Dans une vraie app, remplacez par votre URL d'API
    // fetch('http://localhost:3001/api/aircrafts').then(...)
    // Pour la démo, on simule une liste :
    setAircraftList([
      { id: 1, registration: 'F-GMOD', type: 'C172' },
      { id: 2, registration: 'F-HBLF', type: 'DR400' },
    ]);
  }, []);

  // 2. Calcul automatique de la durée (Block Time)
  useEffect(() => {
    if (formData.offBlock && formData.onBlock) {
      const [h1, m1] = formData.offBlock.split(':').map(Number);
      const [h2, m2] = formData.onBlock.split(':').map(Number);

      let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (minutes < 0) minutes += 24 * 60; // Gestion du passage de minuit

      setTotalTime(minutes);
    }
  }, [formData.offBlock, formData.onBlock]);

  // 3. Gestion des changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      blockTime: totalTime,
      aircraftId: parseInt(formData.aircraftId),
      landingsDay: parseInt(formData.landingsDay),
      landingsNight: parseInt(formData.landingsNight),
    };

    try {
      const res = await fetch('http://localhost:3001/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/'); // Retour au dashboard après succès
        router.refresh();
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour afficher les minutes en HH:MM
  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m < 10 ? '0' : ''}${m}`;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">✈️ Nouveau Vol</h2>

      {/* Ligne 1 : Date et Avion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Avion</label>
          <select
            name="aircraftId"
            required
            value={formData.aircraftId}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Sélectionner un avion...</option>
            {aircraftList.map(ac => (
              <option key={ac.id} value={ac.id}>{ac.registration} ({ac.type})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ligne 2 : Route et Fonction */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Départ (OACI)</label>
          <input
            type="text" name="departure" placeholder="LFPN"
            className="w-full p-2 border rounded uppercase"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Arrivée (OACI)</label>
          <input
            type="text" name="arrival" placeholder="LFOZ"
            className="w-full p-2 border rounded uppercase"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Fonction</label>
          <select
            name="pilotFunction"
            value={formData.pilotFunction}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="PIC">Commandant (PIC)</option>
            <option value="DUAL">Double Commande</option>
            <option value="FI">Instructeur</option>
          </select>
        </div>
      </div>

      {/* Ligne 3 : Temps Bloc (Calcul Auto) */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
        <label className="block text-sm font-bold text-slate-500 mb-2">Blocs (Heures UTC)</label>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-slate-400">OFF BLOCK</span>
            <input
              type="time" name="offBlock"
              value={formData.offBlock} onChange={handleChange}
              className="block w-full p-2 border rounded font-mono"
            />
          </div>
          <span className="text-slate-400">➝</span>
          <div>
            <span className="text-xs text-slate-400">ON BLOCK</span>
            <input
              type="time" name="onBlock"
              value={formData.onBlock} onChange={handleChange}
              className="block w-full p-2 border rounded font-mono"
            />
          </div>
          <div className="ml-auto text-right">
            <span className="block text-xs text-slate-400">TEMPS TOTAL</span>
            <span className="text-2xl font-bold text-blue-600 font-mono">
              {formatTime(totalTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Ligne 4 : Atterrissages */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Atterrissages Jour</label>
          <input
            type="number" name="landingsDay" min="0"
            value={formData.landingsDay} onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Atterrissages Nuit</label>
          <input
            type="number" name="landingsNight" min="0"
            value={formData.landingsNight} onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer le vol'}
      </button>
    </form>
  );
}
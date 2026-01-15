'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Dans Swarm, le frontend (navigateur client) doit taper sur l'IP publique ou localhost mappé
    fetch('http://localhost:3001/api/dashboard')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <div className="p-10">Chargement de votre carnet de vol...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6">👨‍✈️ Mon Carnet de Vol PPL</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARTE DE RÉCENCE (CURRENCY) */}
        <div className={`p-6 rounded-xl shadow-lg text-white ${data.currency.passenger_ready ? 'bg-green-500' : 'bg-red-500'}`}>
          <h2 className="text-xl font-bold">Emport Passagers</h2>
          <div className="text-4xl font-bold mt-2">{data.currency.landings_90_days} / 3</div>
          <p className="mt-2 text-sm opacity-90">Atterrissages (90 derniers jours)</p>
          <div className="mt-4 font-semibold">
            {data.currency.passenger_ready ? "✅ AUTORISÉ" : "❌ NON AUTORISÉ"}
          </div>
        </div>

        {/* CARTE HEURES TOTALES */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-700">Heures Totales</h2>
          {data.hours.map((stat, idx) => (
            <div key={idx} className="flex justify-between mt-4 border-b pb-2">
              <span className="text-slate-500">{stat.pilotFunction}</span>
              {/* Conversion minutes -> heures */}
              <span className="font-mono font-bold">{(stat._sum.blockTime / 60).toFixed(1)} h</span>
            </div>
          ))}
        </div>

        {/* CARTE ALERTES (MEDICAL / LICENCES) */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-700">Validité</h2>
          {data.alerts.length === 0 ? (
            <p className="text-green-600 mt-4">Tout est à jour ! 👌</p>
          ) : (
            data.alerts.map((alert) => (
              <div key={alert.id} className="mt-2 text-red-600 bg-red-50 p-2 rounded">
                ⚠️ {alert.name} expire le {new Date(alert.expiryDate).toLocaleDateString()}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
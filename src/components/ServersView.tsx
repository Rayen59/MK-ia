import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Server, Cpu, Database, Shield, Zap, RefreshCw, CheckCircle, HardDrive, Network } from 'lucide-react';
import { speechSynth } from '../services/mkEngine';

interface ServersViewProps {
  onBackToChat: () => void;
}

export const ServersView: React.FC<ServersViewProps> = ({ onBackToChat }) => {
  const [clusterCount, setClusterCount] = useState(12800);
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostLevel, setBoostLevel] = useState(1);

  const handleBoostServers = () => {
    if (isBoosting) return;
    setIsBoosting(true);
    speechSynth.speak("Allocation de ressources neuronales supplémentaires sur les serveurs MK privés...");

    setTimeout(() => {
      setIsBoosting(false);
      setClusterCount(prev => prev + 3200);
      setBoostLevel(prev => prev + 1);
      speechSynth.speak(`Serveurs MK augmentés avec succès. Capacité totale : ${clusterCount + 3200} clusters vectoriels actifs.`);
    }, 1800);
  };

  const KNOWLEDGE_BASES = [
    { name: 'Sciences & Physique Quantique', records: '2.4 Millions de documents', status: 'Synchronisé' },
    { name: 'Sécurité Mobile & Systèmes OS', records: '1.8 Million d\'analyses de code', status: 'Actif' },
    { name: 'Linguistique Multi-Langues & Phonétique', records: '980 000 modèles de diction', status: 'Optimisé' },
    { name: 'Code, TypeScript & Architecture Web', records: '3.1 Millions d\'arbres syntaxiques', status: 'Synchronisé' },
    { name: 'Psychologie Conversationnelle Co-Ami', records: '750 000 matrices d\'empathie', status: 'Actif' },
    { name: 'Moteur de Synthèse Graphique Imagine', records: '1.2 Million de vecteurs artistiques', status: 'Prêt' },
  ];

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-3.5rem)] max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
      
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Server className="w-6 h-6 text-indigo-500" />
            <span>Infrastructure Serveurs & Données MK</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Modèle de langage souverain entraîné sur des milliers de bases privées • 0 Clé API externe
          </p>
        </div>

        <button
          type="button"
          onClick={handleBoostServers}
          disabled={isBoosting}
          className="h-11 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-md shrink-0"
        >
          <Zap className={`w-4 h-4 text-amber-400 ${isBoosting ? 'animate-bounce' : ''}`} />
          <span>{isBoosting ? 'Augmentation en cours...' : '⚡ Augmenter les serveurs MK'}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">Clusters de calcul</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 tabular-nums">
            {clusterCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">Niveau d'optimisation {boostLevel}</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">Bases de données</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 tabular-nums">
            6 400+
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">100% Embarquées</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">Clés API Externes</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            0 requise
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">Totalement autonome</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">Latence moyenne</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 tabular-nums">
            18 ms
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">Inférence temps réel</span>
        </div>
      </div>

      {/* Bases de données indexées */}
      <div className="p-5 rounded-3xl bg-neutral-100/70 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 mb-8 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span>Bases de connaissances vectorielles privées MK</span>
        </h3>

        <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
          {KNOWLEDGE_BASES.map((kb, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">{kb.name}</p>
                <p className="text-[11px] text-neutral-500">{kb.records}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold">
                {kb.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

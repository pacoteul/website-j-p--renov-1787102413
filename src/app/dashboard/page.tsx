'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Globe, PhoneCall, CheckCircle2, User, Phone, Play, X, Mail, CheckSquare, MessageCircle, Rocket } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const NICHES = [
  { id: 'garage', label: 'Garage & Mécanique' },
  { id: 'agriculture', label: 'Agriculture & Fermes' },
  { id: 'construction', label: 'Construction & Bâtiment' },
  { id: 'architecture', label: 'Architecture & Design' },
  { id: 'dentist', label: 'Dentiste & Médical' },
  { id: 'food', label: 'Restauration & Boulangerie' },
  { id: 'nature', label: 'Nature & Fleuristes' },
  { id: 'tech', label: 'Tech & Agences' },
  { id: 'abstract', label: 'Consulting & Abstrait' }
];

const COUNTRIES = [
  { id: 'FR', label: 'France', lang: 'fr' },
  { id: 'BE', label: 'Belgique', lang: 'fr' },
  { id: 'CH', label: 'Suisse', lang: 'fr' },
  { id: 'CA', label: 'Canada', lang: 'fr' },
  { id: 'CI', label: 'Côte d\'Ivoire', lang: 'fr' },
  { id: 'SN', label: 'Sénégal', lang: 'fr' },
  { id: 'LU', label: 'Luxembourg', lang: 'fr' },
  { id: 'DE', label: 'Allemagne', lang: 'de' },
  { id: 'NL', label: 'Pays-Bas', lang: 'nl' },
  { id: 'GB', label: 'Angleterre', lang: 'en' }
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Saint-Étienne', 'Le Havre', 'Grenoble', 'Dijon', 'Angers'],
  'BE': ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Louvain', 'Mons', 'Aalst'],
  'CH': ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Winterthour', 'Lucerne', 'Saint-Gall', 'Lugano', 'Bienne'],
  'CA': ['Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Québec', 'Winnipeg', 'Hamilton', 'Halifax'],
  'CI': ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Divo', 'Korhogo', 'Anyama', 'Abengourou', 'Man'],
  'SN': ['Dakar', 'Pikine', 'Touba', 'Thiès', 'Kaolack', 'Mbour', 'Rufisque', 'Ziguinchor', 'Diourbel', 'Tambacounda'],
  'LU': ['Luxembourg', 'Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Ettelbruck', 'Diekirch'],
  'DE': ['Berlin', 'Hambourg', 'Munich', 'Cologne', 'Francfort', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
  'NL': ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Groningue', 'Tilbourg', 'Almere', 'Bréda', 'Nimègue'],
  'GB': ['Londres', 'Birmingham', 'Manchester', 'Glasgow', 'Newcastle', 'Sheffield', 'Liverpool', 'Leeds', 'Bristol', 'Édimbourg']
};

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [query, setQuery] = useState(NICHES[0].id);
  const [location, setLocation] = useState(CITIES_BY_COUNTRY[COUNTRIES[0].id][0]);
  const [country, setCountry] = useState(COUNTRIES[0].id);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('leo');
  
  // Nouveaux états pour la sélection
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [validating, setValidating] = useState(false);
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<number | null>(null);
  const [uploadServiceIndex, setUploadServiceIndex] = useState<number>(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [generatingId, setGeneratingId] = useState<number | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE}/leads`);
      const data = await res.json();
      setLeads(data.leads || []);
      // Nettoyer la sélection des leads qui n'existent plus ou ont changé de statut
      setSelectedLeads([]);
    } catch (error) {
      console.error("Erreur de chargement des leads:", error);
    }
  };

  const runProspector = async () => {
    if (!query || !location) return alert('Remplis le métier et la ville.');
    setLoading(true);
    try {
      const selectedCountryObj = COUNTRIES.find(c => c.id === country);
      const targetLang = selectedCountryObj ? selectedCountryObj.lang : 'fr';

      await fetch(`${API_BASE}/prospect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, country, language: targetLang })
      });
      await fetchLeads();
    } catch (error) {
      alert("Erreur lors de la prospection.");
    }
    setLoading(false);
  };

  const validateSelectedLeads = async () => {
    if (selectedLeads.length === 0) return alert("Sélectionnez au moins une entreprise.");
    setValidating(true);
    try {
      await fetch(`${API_BASE}/validate_leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: selectedLeads })
      });
      await fetchLeads();
      alert(`${selectedLeads.length} entreprises envoyées à Sarah (Design) !`);
    } catch (error) {
      alert("Erreur lors de la validation.");
    }
    setValidating(false);
  };

  const runDesigner = async (leadId: number) => {
    setGeneratingId(leadId);
    try {
      await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId })
      });
      alert("La maquette 3D a bien été générée ! Elle a été transférée à l'équipe d'Envoi (Alex).");
      await fetchLeads();
    } catch (error) {
      alert("Erreur lors de la création de la maquette.");
    }
    setGeneratingId(null);
  };

  const runCaller = async (leadId: number) => {
    try {
      await fetch(`${API_BASE}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, test_number: '+33612345678' })
      });
      alert("L'agent vocal est en train d'appeler (en arrière-plan) !");
    } catch (error) {
      alert("Erreur lors de l'appel.");
    }
  };
  
  const runEmailer = async (leadId: number) => {
    try {
      await fetch(`${API_BASE}/send_email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId })
      });
      alert("L'email est en cours d'envoi par l'Agent !");
    } catch (error) {
      alert("Erreur lors de l'envoi de l'email.");
    }
  };

  const runDeployer = async (leadId: number) => {
    try {
      await fetch(`${API_BASE}/deploy_github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId })
      });
      alert("Le déploiement GitHub a commencé en arrière-plan. Vérifiez vos repos GitHub d'ici quelques instants !");
    } catch (error) {
      alert("Erreur lors du déploiement GitHub.");
    }
  };

  const requestModification = async (leadId: number) => {
    const feedback = window.prompt("Quelles modifications souhaitez-vous apporter à cette maquette ? (ex: 'Change la couleur en rouge et le titre')");
    if (!feedback) return;
    
    setValidating(true); // Utilise le même état de chargement global pour empêcher les clics
    try {
      const res = await fetch(`${API_BASE}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, feedback })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Modifications appliquées par Sarah ! Cliquez sur 'Voir la Maquette 3D' pour voir le résultat.");
        await fetchLeads(); // Pour rafraîchir l'URL Base64
      } else {
        alert("Erreur: " + data.message);
      }
    } catch (error) {
      alert("Erreur lors de la modification.");
    }
    setValidating(false);
  };

  const toggleLeadSelection = (id: number) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  const selectAllNewLeads = (newLeadsIds: number[]) => {
    if (selectedLeads.length === newLeadsIds.length) {
      setSelectedLeads([]); // Tout désélectionner
    }
  };

  const handleUploadImage = async () => {
    if (!uploadFile || showUploadModal === null) return;
    setValidating(true);
    
    const formData = new FormData();
    formData.append('lead_id', showUploadModal.toString());
    formData.append('service_index', uploadServiceIndex.toString());
    formData.append('file', uploadFile);
    
    try {
      const res = await fetch(`${API_BASE}/upload_image`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Image uploadée avec succès ! Consultez le site.");
        setShowUploadModal(null);
        setUploadFile(null);
        await fetchLeads(); // IMPORTANT: Rafraîchir pour avoir le nouveau lien Base64
      } else {
        alert("Erreur: " + data.message);
      }
    } catch (error) {
      alert("Erreur réseau lors de l'upload.");
    }
    setValidating(false);
  };

  // Filtrage des listes
  const newLeads = leads.filter(l => l.status === 'new' || !l.status);
  const validatedLeads = leads.filter(l => l.status === 'validated');
  const readyLeads = leads.filter(l => l.status === 'prototype_ready');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Agence IA</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">BUREAU VIRTUEL</p>
            </div>
          </div>
          
          <div className="flex bg-slate-900 rounded-full p-1 border border-white/5 shadow-inner">
            <TabButton active={activeTab === 'leo'} onClick={() => setActiveTab('leo')} icon={<Search className="w-4 h-4"/>} label="Léo (Scan)" />
            <TabButton active={activeTab === 'sarah'} onClick={() => setActiveTab('sarah')} icon={<Globe className="w-4 h-4"/>} label="Sarah (Design)" />
            <TabButton active={activeTab === 'alex'} onClick={() => setActiveTab('alex')} icon={<PhoneCall className="w-4 h-4"/>} label="Alex (Envois)" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Léo : Prospecteur */}
        {activeTab === 'leo' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Search className="w-48 h-48" />
              </div>
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
                  <User className="w-4 h-4" /> Agent Prospecteur
                </div>
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Scanner Google Maps</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Léo scanne Google Maps pour trouver des entreprises sans site web.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {/* Select Niche */}
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    >
                      {NICHES.map(niche => (
                        <option key={niche.id} value={niche.id}>{niche.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Select Country */}
                  <div className="flex-1 relative">
                    <Globe className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setLocation(CITIES_BY_COUNTRY[e.target.value][0]);
                      }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      {CITIES_BY_COUNTRY[country].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={runProspector}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                  >
                    {loading ? <span className="animate-pulse">Scan en cours...</span> : 'Lancer le Scan'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Table des Leads Léo avec Validation */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-400" /> Nouveaux Prospects
                  </h3>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">{newLeads.length} à traiter</span>
                </div>
                
                {/* Bouton de Validation Multiple */}
                {selectedLeads.length > 0 && (
                  <button 
                    onClick={validateSelectedLeads}
                    disabled={validating}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {validating ? 'Validation...' : `Valider la sélection (${selectedLeads.length})`}
                    {!validating && <CheckSquare className="w-4 h-4" />}
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="p-5 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-white/20 bg-slate-900 cursor-pointer text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-950"
                          checked={newLeads.length > 0 && selectedLeads.length === newLeads.length}
                          onChange={() => selectAllNewLeads(newLeads.map(l => l.id))}
                        />
                      </th>
                      <th className="p-5">Entreprise</th>
                      <th className="p-5">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {newLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleLeadSelection(lead.id)}>
                        <td className="p-5 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-white/20 bg-slate-900 cursor-pointer text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-950"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-5">
                          <div className="font-medium text-white mb-1">{lead.name}</div>
                          <div className="text-slate-500 text-sm flex items-center gap-1"><MapPin className="w-3 h-3"/> {lead.address}</div>
                        </td>
                        <td className="p-5 text-slate-400 font-mono text-sm space-y-1">
                          {lead.phone_number ? (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-500"/> {lead.phone_number}
                              {lead.has_whatsapp ? <span title="WhatsApp Disponible"><MessageCircle className="w-4 h-4 text-green-400 ml-2" /></span> : null}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-600"><Phone className="w-3 h-3"/> Pas de téléphone</div>
                          )}
                          {lead.email ? (
                            <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-500"/> {lead.email}</div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-600"><Mail className="w-3 h-3"/> Pas d'email</div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {newLeads.length === 0 && (
                      <tr><td colSpan={3} className="p-12 text-center text-slate-500">Aucun nouveau lead. Lancez un scan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sarah : Web Designer */}
        {activeTab === 'sarah' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe className="w-48 h-48 text-purple-500" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-6 border border-purple-500/20">
                  <User className="w-4 h-4" /> Agent Designer
                </div>
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Générer les Maquettes</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Sarah génère les sites pour les entreprises que vous avez validées chez Léo.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-slate-400 text-sm font-medium tracking-wide">
                    <th className="p-5 font-medium">Entreprise (Validée)</th>
                    <th className="p-5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {validatedLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5 font-medium">{lead.name}</td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => runDesigner(lead.id)} 
                          disabled={generatingId === lead.id}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all text-sm flex items-center gap-2 ml-auto disabled:opacity-50"
                        >
                          {generatingId === lead.id ? (
                            <span className="animate-pulse flex items-center gap-2">Génération...</span>
                          ) : (
                            <><Play className="w-4 h-4" /> Générer 3D</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {validatedLeads.length === 0 && (
                    <tr><td colSpan={2} className="p-12 text-center text-slate-500">Aucun lead validé en attente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alex : Closer / Vendeur */}
        {activeTab === 'alex' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                <PhoneCall className="w-48 h-48 text-emerald-500" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/20">
                  <User className="w-4 h-4" /> Agents d'Envoi
                </div>
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Campagne d'Envois</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Alex appelle ou envoie un email aux prospects dont la maquette 3D est prête !
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readyLeads.map(lead => (
                <div key={lead.id} className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-colors group flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">{lead.name}</h3>
                      {lead.phone_number && <p className="text-slate-400 text-sm flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-500" /> {lead.phone_number} {lead.has_whatsapp && <span title="WhatsApp Disponible"><MessageCircle className="w-4 h-4 text-green-400 ml-1" /></span>}</p>}
                      {lead.email && <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><Mail className="w-3 h-3 text-blue-500" /> {lead.email}</p>}
                      {!lead.phone_number && !lead.email && <p className="text-rose-400 text-sm mt-1">Aucun contact trouvé</p>}
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <a 
                      href={lead.demo_url || `/?lead=${lead.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl shadow-inner transition-all flex items-center justify-center gap-2 border border-white/5"
                    >
                      <Globe className="w-5 h-5 text-purple-400" /> Voir la Maquette 3D
                    </a>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => requestModification(lead.id)}
                        disabled={validating}
                        className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium py-2 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 text-sm"
                      >
                        ✏️ Modifier Texte
                      </button>
                      <button 
                        onClick={() => setShowUploadModal(lead.id)}
                        disabled={validating}
                        className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium py-2 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 text-sm"
                      >
                        📸 Uploader Photo
                      </button>
                    </div>
                    {lead.phone_number && (
                      <button 
                        onClick={() => runCaller(lead.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <PhoneCall className="w-5 h-5" /> Appeler (Vapi)
                      </button>
                    )}
                    {lead.email && !lead.phone_number && (
                      <button 
                        onClick={() => runEmailer(lead.id)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Mail className="w-5 h-5" /> Envoyer un Email
                      </button>
                    )}
                    
                    <button 
                      onClick={() => runDeployer(lead.id)}
                      className="w-full bg-slate-100 hover:bg-white text-slate-900 font-medium py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <Rocket className="w-5 h-5" /> Déployer (GitHub vers Vercel)
                    </button>
                  </div>
                </div>
              ))}
              
              {readyLeads.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                  Aucune maquette prête.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
      
      {/* Upload Modal */}
      {showUploadModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Uploader une Photo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Choisir le service à illustrer</label>
                <select 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500"
                  value={uploadServiceIndex}
                  onChange={(e) => setUploadServiceIndex(Number(e.target.value))}
                >
                  <option value={0}>Service 1 (Grande carte haut)</option>
                  <option value={1}>Service 2 (Petite carte bas-gauche)</option>
                  <option value={2}>Service 3 (Petite carte bas-droite)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Fichier image (.jpg, .png)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowUploadModal(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleUploadImage}
                disabled={validating || !uploadFile}
                className="flex-1 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg transition-colors disabled:opacity-50"
              >
                {validating ? "Upload en cours..." : "Valider"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${active ? 'bg-slate-800 text-white shadow-md border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      {icon} {label}
    </button>
  );
}

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { SurveyData } from '@/types/survey';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';

// Correção padrão para os ícones do Leaflet no React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaCalorTabProps {
  surveys: SurveyData[];
}

export default function MapaCalorTab({ surveys }: MapaCalorTabProps) {
  // Filtra apenas as entrevistas que possuem latitude e longitude válidas
  const entrevistasComCoordenadas = useMemo(() => {
    return surveys.filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number');
  }, [surveys]);

  // Centro padrão do mapa (ex: São Paulo ou calcula com base na primeira entrevista)
  const centroMapa = useMemo(() => {
    if (entrevistasComCoordenadas.length > 0) {
      return [entrevistasComCoordenadas[0].latitude!, entrevistasComCoordenadas[0].longitude!] as [number, number];
    }
    return [-23.5505, -46.6333] as [number, number]; // Coordenadas padrão de SP
  }, [entrevistasComCoordenadas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" /> Geolocalização e Mapa de Coleta em Campo
          </h2>
          <p className="text-xs text-gray-500">Acompanhe a distribuição geográfica e a comprovação de presença dos entrevistadores.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-1.5 rounded-lg font-medium">
          Total com GPS: <strong>{entrevistasComCoordenadas.length}</strong> de {surveys.length} entrevistas
        </div>
      </div>

      {entrevistasComCoordenadas.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma coordenada de geolocalização registrada ainda.</p>
          <p className="text-xs text-gray-400 mt-1">As entrevistas enviadas pelos aparelhos em campo com permissão de GPS aparecerão aqui automaticamente.</p>
        </div>
      ) : (
        <div className="card p-4 border border-gray-200 overflow-hidden shadow-sm">
          <div className="h-[500px] w-full rounded-lg overflow-hidden z-10">
            <MapContainer center={centroMapa} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {entrevistasComCoordenadas.map((s) => (
                <Marker key={s.id} position={[s.latitude!, s.longitude!]}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-gray-900">{s.cidade} / {s.estado}</p>
                      <p><strong>Entrevistador:</strong> {s.interviewer_name}</p>
                      <p><strong>Bairro/Localidade:</strong> {s.bairro || 'Não informado'}</p>
                      <p><strong>Rodada:</strong> {s.rodada}</p>
                      <p className="text-[10px] text-gray-400">Data: {new Date(s.created_at || '').toLocaleString('pt-BR')}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
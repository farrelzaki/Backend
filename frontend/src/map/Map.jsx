import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_URL = "http://localhost:5000/api/fasilitas";

// Skema warna berdasarkan kategori fasilitas
const getCategoryColor = (kategori) => {
  if (!kategori) return "#06b6d4";
  if (kategori.includes("Daerah")) return "#ef4444";
  if (kategori.includes("Khusus")) return "#a855f7";
  if (kategori.includes("Swasta")) return "#10b981";
  if (kategori.includes("Masyarakat") || kategori.includes("Puskesmas")) return "#f59e0b";
  if (kategori.includes("Umum")) return "#3b82f6";
  return "#06b6d4";
};

// Styling titik fasilitas
const style = (feature) => ({
  fillColor: getCategoryColor(feature?.properties?.kategori),
  weight: 2,
  opacity: 1,
  color: "#ffffff",
  fillOpacity: 0.85,
  radius: 8,
});

const highlightFeature = (e) => {
  const layer = e.target;
  if (layer.setStyle) {
    layer.setStyle({
      weight: 3,
      color: "#0f172a",
      fillOpacity: 1,
      radius: 10,
    });
  }
  if (layer.bringToFront) {
    layer.bringToFront();
  }
};

const resetHighlight = (e) => {
  const layer = e.target;
  if (layer.setStyle && layer.feature) {
    layer.setStyle(style(layer.feature));
  }
};

const onEachFeature = (feature, layer) => {
  const p = feature.properties;
  layer.bindPopup(`
    <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; min-width: 220px; color: #1e293b;">
      <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${p.nama_fasilitas}</h3>
      <div style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #ffffff; background-color: ${getCategoryColor(p.kategori)}; margin-bottom: 6px;">
        ${p.kategori}
      </div>
      ${p.keterangan ? `<p style="margin: 4px 0; color: #475569; font-size: 12px;">${p.keterangan}</p>` : ""}
      ${p.sumber ? `<div style="font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">Sumber: ${p.sumber}</div>` : ""}
    </div>
  `);
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
  });
};

const pointToLayer = (feature, latlng) => {
  return L.circleMarker(latlng, style(feature));
};

const Map = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load GeoJSON", err);
        setLoading(false);
      });
  }, []);

  // Pusat koordinat Kota Bogor sesuai sebaran data fasilitas_shp
  const centerPosition = [-6.5950, 106.7900];

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Header Panel */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(8px)",
          color: "#f8fafc",
          padding: "12px 18px",
          borderRadius: "10px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
          maxWidth: "320px",
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 4px 0" }}>
          WebGIS Fasilitas Kesehatan
        </h2>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
          Kota Bogor &bull; {data?.features?.length ? `${data.features.length} Titik Terdata` : "Memuat..."}
        </p>
      </div>

      {/* Legenda Kategori */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 16,
          zIndex: 1000,
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(8px)",
          color: "#f8fafc",
          padding: "12px 16px",
          borderRadius: "10px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: "12px",
        }}
      >
        <div style={{ fontWeight: "700", marginBottom: "8px", color: "#e2e8f0" }}>Legenda Fasilitas:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { label: "RS Umum Daerah", color: "#ef4444" },
            { label: "RS Umum", color: "#3b82f6" },
            { label: "RS Swasta", color: "#10b981" },
            { label: "RS Khusus", color: "#a855f7" },
            { label: "Puskesmas", color: "#f59e0b" },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  border: "1px solid #ffffff",
                  display: "inline-block",
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data && (
          <GeoJSON
            data={data}
            style={style}
            pointToLayer={pointToLayer}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;

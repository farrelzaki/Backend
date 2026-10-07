const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
              'id', gid,
              'nama_fasilitas', nama, 
              'kategori', jenis,
              'keterangan', keterangan,
              'sumber', sumber
            )
          )
        ), '[]'::jsonb)
      ) AS geojson
      FROM fasilitas_shp;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0].geojson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

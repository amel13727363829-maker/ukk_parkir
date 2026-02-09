const express = require('express');
const router = express.Router();
const { JenisParkir } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// Temporary debug endpoint (NO AUTH) to update jenis parkir by id
// Usage: PUT /api/v1/debug/jenis-parkir/:id with JSON body { harga_awal, harga_per_jam }
router.put('/jenis-parkir/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { harga_awal, harga_per_jam, kapasitas, nama_jenis, deskripsi } = req.body;

    console.log('[debug] update payload for id', id, req.body);

    const jenis = await JenisParkir.findByPk(id);
    if (!jenis) return errorResponse(res, 404, 'Jenis parkir tidak ditemukan');

    if (harga_awal !== undefined) jenis.harga_awal = harga_awal;
    if (harga_per_jam !== undefined) jenis.harga_per_jam = harga_per_jam;
    if (kapasitas !== undefined) jenis.kapasitas = kapasitas;
    if (nama_jenis !== undefined) jenis.nama_jenis = nama_jenis;
    if (deskripsi !== undefined) jenis.deskripsi = deskripsi;

    await jenis.save();

    const updated = await JenisParkir.findByPk(id);
    console.log('[debug] updated record:', { id: updated.id_jenis_parkir, harga_awal: updated.harga_awal, harga_per_jam: updated.harga_per_jam });

    return successResponse(res, 200, updated, 'Debug update successful');
  } catch (err) {
    console.error('[debug] error updating jenis parkir:', err);
    return errorResponse(res, 500, 'Internal server error');
  }
});

module.exports = router;

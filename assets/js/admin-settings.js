(function () {
  'use strict';
  var C = window.CONFIG || {};
  var id = String(C.idUndangan || 'undangan').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'undangan';
  var key = 'undangan_admin_settings_v1_' + id;

  function read() {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Data pengaturan tersimpan tidak valid.');
      }
      return data;
    } catch (error) {
      console.error('Gagal membaca pengaturan undangan dari penyimpanan browser.', error);
      return null;
    }
  }

  function apply(config, data) {
    if (!data) return config;
    if (data.bagian && typeof data.bagian === 'object') {
      config.bagian = Object.assign({}, config.bagian || {}, data.bagian);
    }
    if (Array.isArray(data.rekeningAktif)) {
      config.rekening = (config.rekening || []).map(function (rekening, index) {
        return Object.assign({}, rekening, { aktif: data.rekeningAktif[index] === true });
      });
    }
    if (typeof data.teksWA === 'string') config.teksWA = data.teksWA;
    return config;
  }

  window.loadAdminSettings = function () {
    return read();
  };
  window.applyAdminSettings = function (config, data) {
    return apply(config, data || read());
  };
  window.saveAdminSettings = function (data, config) {
    localStorage.setItem(key, JSON.stringify(data));
    return apply(config, data);
  };
})();

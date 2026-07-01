const navbar = document.querySelector('.navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 2px 12px rgba(28, 43, 34, 0.1)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.card, .step, .stat').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

const STORAGE_KEY = 'klinik_daftar_pasien';

function ambilDataPasien() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function simpanDataPasien(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const formJanji = document.getElementById('formJanji');

if (formJanji) {

  const dataDokter = {
    'Umum': [
      { value: 'dr. Partono Tan', label: 'dr. Partono Tan' }
    ],
    'Gigi': [
      { value: 'drg. Jhon Sebastian Marpaung', label: 'drg. Jhon Sebastian Marpaung' }
    ],
    'Anak': [
      { value: 'dr. Yosafat Dharma Purba, Sp.A', label: 'dr. Yosafat Dharma Purba, Sp.A' }
    ],
    'Penyakit Dalam': [
      { value: 'dr. Ariep Adhi Pratama, Sp.PD', label: 'dr. Ariep Adhi Pratama, Sp.PD' }
    ]
  };

  const jadwalDokter = {
    'dr. Partono Tan': [0, 1, 2, 3, 4, 5, 6],
    'drg. Jhon Sebastian Marpaung': [1, 2, 3, 4, 5, 6],
    'dr. Yosafat Dharma Purba, Sp.A': [1, 2, 3, 4, 5],
    'dr. Ariep Adhi Pratama, Sp.PD': [1, 3, 5]
  };

  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const selectPoli = document.getElementById('poli');
  const selectDokter = document.getElementById('dokter');
  const inputTanggalKunjungan = document.getElementById('tanggalKunjungan');
  const inputTanggalLahir = document.getElementById('tanggalLahir');
  const inputNIK = document.getElementById('nik');
  const emailGroup = document.getElementById('emailGroup');
  const inputEmail = document.getElementById('email');
  const radioMetode = document.querySelectorAll('input[name="metodePengiriman"]');

  const today = new Date();
  const toDateStr = (d) => d.toISOString().split('T')[0];
  inputTanggalLahir.max = toDateStr(today);
  inputTanggalKunjungan.min = toDateStr(today);

  radioMetode.forEach(radio => {
    radio.addEventListener('change', () => {
      const pilihEmail = radio.value === 'email' && radio.checked;
      emailGroup.style.display = pilihEmail ? 'flex' : 'none';
      if (pilihEmail) {
        inputEmail.setAttribute('required', 'true');
      } else {
        inputEmail.removeAttribute('required');
        inputEmail.value = '';
      }
    });
  });

  selectPoli.addEventListener('change', () => {
    const dokterList = dataDokter[selectPoli.value] || [];
    selectDokter.innerHTML = '<option value="" disabled selected>-- Pilih Dokter --</option>';
    dokterList.forEach(({ value, label }) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      selectDokter.appendChild(opt);
    });
    inputTanggalKunjungan.value = '';
  });

  inputTanggalKunjungan.addEventListener('change', () => {
    const dokterDipilih = selectDokter.value;
    if (!dokterDipilih) return;

    const hariPraktik = jadwalDokter[dokterDipilih];
    const tanggal = new Date(inputTanggalKunjungan.value + 'T00:00:00');
    const hariDipilih = tanggal.getDay();

    if (!hariPraktik.includes(hariDipilih)) {
      const hariPraktikNama = hariPraktik.map(h => namaHari[h]).join(', ');
      alert(`Dokter ini hanya praktik pada: ${hariPraktikNama}.\nSilakan pilih tanggal yang sesuai.`);
      inputTanggalKunjungan.value = '';
    }
  });

  inputNIK.addEventListener('input', () => {
    inputNIK.value = inputNIK.value.replace(/\D/g, '').slice(0, 16);
  });

  formJanji.addEventListener('submit', (e) => {
    e.preventDefault();

    if (inputNIK.value.length !== 16) {
      alert('NIK harus terdiri dari 16 digit angka.');
      inputNIK.focus();
      return;
    }

    const nama = document.getElementById('nama').value.trim();
    const nik = inputNIK.value;
    const tanggalLahir = inputTanggalLahir.value;
    const jenisKelamin = document.querySelector('input[name="jenisKelamin"]:checked')?.value || '-';
    const telepon = document.getElementById('telepon').value.trim();
    const statusPasien = document.querySelector('input[name="statusPasien"]:checked')?.value || '-';
    const bpjs = document.querySelector('input[name="bpjs"]:checked')?.value || '-';
    const poli = selectPoli.value;
    const dokter = selectDokter.value;
    const tanggalKunjungan = inputTanggalKunjungan.value;
    const keluhan = document.getElementById('keluhan').value.trim();
    const metode = document.querySelector('input[name="metodePengiriman"]:checked')?.value;

    const dataBaru = {
      id: Date.now(),
      nama, nik, tanggalLahir, jenisKelamin, telepon,
      statusPasien, bpjs, poli, dokter, tanggalKunjungan, keluhan
    };

    const dataPasien = ambilDataPasien();
    dataPasien.push(dataBaru);
    simpanDataPasien(dataPasien);

    const pesan =
      `*PENDAFTARAN JANJI TEMU*
*Klinik Sehat Bersama*
 
*— Data Diri Pasien —*
Nama          : ${nama}
NIK           : ${nik}
Tgl. Lahir    : ${tanggalLahir}
Jenis Kelamin : ${jenisKelamin}
No. Telepon   : ${telepon}
 
*— Data Kunjungan —*
Status Pasien : ${statusPasien}
BPJS          : ${bpjs}
Poli          : ${poli}
Dokter        : ${dokter}
Tgl. Kunjungan: ${tanggalKunjungan}
Keluhan       : ${keluhan}`;

    if (metode === 'whatsapp') {
      const nomorWA = '6285831581425';
      window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`, '_blank');
    } else if (metode === 'email') {
      const emailTujuan = 'kliniksehatbersama@email.com';
      const subject = encodeURIComponent('Pendaftaran Janji Temu - Klinik Sehat Bersama');
      window.open(`mailto:${emailTujuan}?subject=${subject}&body=${encodeURIComponent(pesan)}`, '_blank');
    }

    alert('Pendaftaran berhasil disimpan! Data dapat dilihat di halaman Daftar Pasien.');
    formJanji.reset();
    emailGroup.style.display = 'none';
  });
}

const tabelBody = document.getElementById('tabelBody');
const totalPasien = document.getElementById('totalPasien');
const emptyState = document.getElementById('emptyState');
const btnHapusSemua = document.getElementById('btnHapusSemua');

function renderTabel() {
  if (!tabelBody) return;

  const data = ambilDataPasien();
  tabelBody.innerHTML = '';

  if (data.length === 0) {
    emptyState.style.display = 'flex';
    tabelBody.closest('table').style.display = 'none';
    btnHapusSemua.style.display = 'none';
    totalPasien.textContent = '0';
    return;
  }

  emptyState.style.display = 'none';
  tabelBody.closest('table').style.display = 'table';
  btnHapusSemua.style.display = 'inline-block';
  totalPasien.textContent = data.length;

  data.forEach((pasien, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${pasien.nama}</strong></td>
      <td>${pasien.nik}</td>
      <td>${pasien.tanggalLahir}</td>
      <td>${pasien.jenisKelamin}</td>
      <td>${pasien.telepon}</td>
      <td>${pasien.statusPasien}</td>
      <td>${pasien.bpjs}</td>
      <td>${pasien.poli}</td>
      <td>${pasien.dokter}</td>
      <td>${pasien.tanggalKunjungan}</td>
      <td class="keluhan-cell">${pasien.keluhan}</td>
      <td>
        <button class="btn-hapus-row" data-id="${pasien.id}">Hapus</button>
      </td>
    `;
    tabelBody.appendChild(tr);
  });

  tabelBody.querySelectorAll('.btn-hapus-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      if (confirm('Hapus data pasien ini?')) {
        const dataBaru = ambilDataPasien().filter(p => p.id !== id);
        simpanDataPasien(dataBaru);
        renderTabel();
      }
    });
  });
}

if (btnHapusSemua) {
  btnHapusSemua.addEventListener('click', () => {
    if (confirm('Hapus SEMUA data pasien? Tindakan ini tidak dapat dibatalkan.')) {
      simpanDataPasien([]);
      renderTabel();
    }
  });
}

renderTabel();
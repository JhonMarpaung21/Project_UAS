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

const formJanji = document.getElementById('formJanji');

if (formJanji) {

  // --- Data dokter per poli ---
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

  // --- Hari praktik per dokter (0=Minggu, 1=Senin, ..., 6=Sabtu) ---
  const jadwalDokter = {
    'dr. Partono Tan'                  : [0, 1, 2, 3, 4, 5, 6],
    'drg. Jhon Sebastian Marpaung'     : [1, 2, 3, 4, 5, 6],
    'dr. Yosafat Dharma Purba, Sp.A'   : [1, 2, 3, 4, 5],
    'dr. Ariep Adhi Pratama, Sp.PD'    : [1, 3, 5]
  };

  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const selectPoli             = document.getElementById('poli');
  const selectDokter           = document.getElementById('dokter');
  const inputTanggalKunjungan  = document.getElementById('tanggalKunjungan');
  const inputTanggalLahir      = document.getElementById('tanggalLahir');
  const inputNIK               = document.getElementById('nik');
  const emailGroup             = document.getElementById('emailGroup');
  const inputEmail             = document.getElementById('email');
  const radioMetode            = document.querySelectorAll('input[name="metodePengiriman"]');

  // --- Batasi tanggal lahir: tidak boleh melebihi hari ini ---
  const today = new Date();
  const toDateStr = (d) => d.toISOString().split('T')[0];
  inputTanggalLahir.max = toDateStr(today);

  // --- Batasi tanggal kunjungan: tidak boleh sebelum hari ini ---
  inputTanggalKunjungan.min = toDateStr(today);

  // --- Toggle field email ---
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

  // --- Filter dokter berdasarkan poli yang dipilih ---
  selectPoli.addEventListener('change', () => {
    const dokterList = dataDokter[selectPoli.value] || [];

    selectDokter.innerHTML = '<option value="" disabled selected>-- Pilih Dokter --</option>';
    dokterList.forEach(({ value, label }) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      selectDokter.appendChild(opt);
    });

    // Reset tanggal kunjungan saat poli berubah
    inputTanggalKunjungan.value = '';
  });

  // --- Validasi tanggal kunjungan sesuai hari praktik dokter ---
  inputTanggalKunjungan.addEventListener('change', () => {
    const dokterDipilih = selectDokter.value;
    if (!dokterDipilih) return;

    const hariPraktik = jadwalDokter[dokterDipilih];
    // Tambah satu hari offset untuk menghindari timezone shift
    const tanggal = new Date(inputTanggalKunjungan.value + 'T00:00:00');
    const hariDipilih = tanggal.getDay();

    if (!hariPraktik.includes(hariDipilih)) {
      const hariPraktikNama = hariPraktik.map(h => namaHari[h]).join(', ');
      alert(`Dokter ini hanya praktik pada: ${hariPraktikNama}.\nSilakan pilih tanggal yang sesuai.`);
      inputTanggalKunjungan.value = '';
    }
  });

  // --- Validasi NIK: hanya angka, max 16 digit ---
  inputNIK.addEventListener('input', () => {
    inputNIK.value = inputNIK.value.replace(/\D/g, '').slice(0, 16);
  });

  // --- Submit form ---
  formJanji.addEventListener('submit', (e) => {
    e.preventDefault();

    // Cek NIK 16 digit
    if (inputNIK.value.length !== 16) {
      alert('NIK harus terdiri dari 16 digit angka.');
      inputNIK.focus();
      return;
    }

    // Ambil semua nilai
    const nama            = document.getElementById('nama').value.trim();
    const nik             = inputNIK.value;
    const tanggalLahir    = inputTanggalLahir.value;
    const jenisKelamin    = document.querySelector('input[name="jenisKelamin"]:checked')?.value || '-';
    const telepon         = document.getElementById('telepon').value.trim();
    const statusPasien    = document.querySelector('input[name="statusPasien"]:checked')?.value || '-';
    const bpjs            = document.querySelector('input[name="bpjs"]:checked')?.value || '-';
    const poli            = selectPoli.value;
    const dokter          = selectDokter.value;
    const tanggalKunjungan = inputTanggalKunjungan.value;
    const keluhan         = document.getElementById('keluhan').value.trim();
    const metode          = document.querySelector('input[name="metodePengiriman"]:checked')?.value;

    // Rakit pesan
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
      const emailTujuan = 'kliniksehatbersama@email.com'; // ganti dengan email klinik asli
      const subject = encodeURIComponent('Pendaftaran Janji Temu - Klinik Sehat Bersama');
      window.open(`mailto:${emailTujuan}?subject=${subject}&body=${encodeURIComponent(pesan)}`, '_blank');
    }
  });

}

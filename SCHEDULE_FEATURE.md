# Fitur Jadwal Pembelajaran

Fitur jadwal pembelajaran telah berhasil ditambahkan ke startpage dengan fungsionalitas berikut:

## Fitur yang Ditambahkan

### 1. **Tampilan Jadwal Real-time**
- Menampilkan mata pelajaran yang sedang berlangsung
- Menunjukkan mata pelajaran selanjutnya
- Update otomatis setiap menit

### 2. **Status Dinamis**
- **Sedang berlangsung** - Warna orange, menunjukkan kelas aktif
- **Selesai - Istirahat** - Warna abu-abu, menunjukkan kelas selesai tapi masih ada kelas lagi
- **Menunggu kelas dimulai** - Warna biru, menunjukkan menunggu kelas pertama
- **Hari libur** - Untuk hari tanpa jadwal

### 3. **Informasi Lengkap**
- Waktu mulai dan durasi kelas
- Nama mata pelajaran
- **Nama guru pengajar** (NEW!)
- Preview kelas selanjutnya (termasuk besok jika tidak ada lagi hari ini)
- Nama hari dalam bahasa Indonesia

### 4. **Responsive Design**
- Tampilan mobile-friendly
- Penyesuaian layout untuk berbagai ukuran layar

## Konfigurasi

### Struktur Config.json
```json
{
  "schedule": {
    "enabled": true,
    "classes": {
      "monday": [
        {"subject": "Matematika", "startTime": "07:30", "duration": 2, "teacher": "Pak Ahmad"},
        {"subject": "Bahasa Indonesia", "startTime": "09:30", "duration": 1.5, "teacher": "Bu Sari"}
      ],
      "tuesday": [...],
      // dst untuk semua hari
    }
  }
}
```

### Parameter Jadwal
- **enabled**: `true/false` - Mengaktifkan/menonaktifkan fitur jadwal
- **subject**: Nama mata pelajaran
- **startTime**: Waktu mulai format "HH:MM"
- **duration**: Durasi dalam jam desimal (misal: 0.75 = 45 menit, 1.5 = 1 jam 30 menit)
- **teacher**: Nama guru pengajar (opsional)

## Files yang Ditambahkan/Dimodifikasi

1. **index.html** - Menambah struktur HTML untuk jadwal
2. **css/main.css** - Styling untuk komponen jadwal
3. **js/schedule.js** - Logic untuk manajemen jadwal (file baru)
4. **js/main.js** - Integrasi dengan sistem utama
5. **config.json** - Konfigurasi jadwal pembelajaran

## Cara Penggunaan

1. Buka startpage di browser
2. Jadwal akan otomatis muncul di antara search bar dan bookmark
3. Untuk mengubah jadwal, tekan `Ctrl + ,` untuk membuka settings
4. Edit bagian "schedule" di JSON editor
5. Klik export/import untuk backup/restore konfigurasi

## Tips Penggunaan

- Gunakan format 24 jam untuk `startTime` (misal: "13:30" untuk 1:30 PM)
- **Duration format desimal:**
  - `0.25` = 15 menit
  - `0.5` = 30 menit  
  - `0.75` = 45 menit
  - `1` = 1 jam
  - `1.5` = 1 jam 30 menit
  - `2.25` = 2 jam 15 menit
- Field `teacher` bersifat opsional - jika tidak diisi akan menampilkan "--"
- Kosongkan array hari (misal: `"saturday": []`) untuk hari libur
- Jadwal akan otomatis update setiap menit untuk menunjukkan status terkini
- Nama guru ditampilkan di bawah nama mata pelajaran dengan font italic
- Durasi akan ditampilkan dalam format yang mudah dibaca (misal: "45 menit", "1 jam 30 menit")

Fitur ini terintegrasi penuh dengan sistem startpage yang ada dan dapat dikonfigurasi melalui JSON editor yang sudah tersedia.

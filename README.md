# VR Olay Yeri — Eğitim Analiz ve Performans Paneli

Bu proje, Sanal Gerçeklik (VR) ortamında gerçekleştirilen **Olay Yeri İnceleme** eğitimlerinin sonuçlarını analiz etmek, raporlamak ve görselleştirmek için geliştirilmiş modern bir web tabanlı dashboard uygulamasıdır. 

"Forensic Obsidian" tasarım felsefesi temel alınarak; tamamen karanlık tema, glassmorphism kart yapıları ve endüstriyel standartlara uygun estetik bir arayüz kurgulanmıştır.

## 🌟 Temel Özellikler

- **Gerçek Zamanlı Veri Akışı:** Firebase Realtime Database entegrasyonu ile VR platformundan gelen tüm eğitim verilerini, sınav sonuçlarını ve hataları anlık olarak çeker.
- **VR Hareket Isı Haritası (Heatmap):** Kursiyerlerin sanal ortamdaki x, z koordinatlarındaki tüm hareket izlerini işleyerek 2 boyutlu interaktif HTML Canvas ısı haritasına dönüştürür.
- **Olay Yeri Fotoğraf Analizi:** Öğrencilerin VR deneyimi sırasında "sanal fotoğraf makinesi" aracılığıyla çektiği kanıtların Base64 formatlı görüntülerini interaktif Lightbox galerisiyle incelemeye olanak tanır.
- **Kapsamlı İstatistikler:** Modül bazlı katılım grafikleri, sınav hata/başarı oranları, süre ve mesafe ölçümleri gibi gelişmiş analiz verileri barındırır.
- **Modern ve Performanslı Arayüz:** Vanilla CSS, Tailwind CSS V4 ve React.js kullanılarak; karmaşadan uzak, yüksek UX (Kullanıcı Deneyimi) standartlarına sahip bir sistem sunar.

## 🛠 Kullanılan Teknolojiler

- **Frontend Core:** React 19, Vite 8
- **Stil & Tasarım Sistemi:** Tailwind CSS v4, Glassmorphism, CSS Custom Properties
- **Veri Tabanı & Backend:** Firebase Realtime Database
- **Veri Görselleştirme:** Recharts (Grafikler), Custom HTML5 Canvas (Hareket Haritası)
- **Tipografi:** Outfit & JetBrains Mono (Google Fonts)
- **Uyumluluk:** Tamamen responsive tasarım özelliklerini destekler.

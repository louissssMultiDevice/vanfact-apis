import { createCanvas } from 'canvas';
import { success, error, getCache, setCache, getClientIP, checkRateLimit, randomString } from '../lib/myfunc.js';
import { trackEndpoint } from './status.js';

const planetData = {
  merkurius: {
    nama: "Merkurius",
    tipe: "Planet Terestrial",
    diameter: "4.879 km",
    massa: "3.30 × 10^23 kg",
    jarak: "57,9 juta km",
    orbit: "88 hari",
    rotasi: "59 hari",
    suhu: "-173°C hingga 427°C",
    fakta: [
      "Planet terdekat dari Matahari.",
      "Tidak memiliki satelit.",
      "Atmosfer sangat tipis."
    ],
    warna: "#b1b1b1"
  },
  venus: {
    nama: "Venus",
    tipe: "Planet Terestrial",
    diameter: "12.104 km",
    massa: "4.87 × 10^24 kg",
    jarak: "108 juta km",
    orbit: "225 hari",
    rotasi: "243 hari (retrograde)",
    suhu: "±465°C",
    fakta: [
      "Planet terpanas di Tata Surya.",
      "Tekanan atmosfer 90x Bumi.",
      "Rotasi berlawanan arah."
    ],
    warna: "#eccc9a"
  },
  bumi: {
    nama: "Bumi",
    tipe: "Planet Terestrial",
    diameter: "12.742 km",
    massa: "5.97 × 10^24 kg",
    jarak: "149,6 juta km",
    orbit: "365,25 hari",
    rotasi: "24 jam",
    suhu: "-88°C hingga 58°C",
    fakta: [
      "Satu-satunya planet dengan kehidupan.",
      "71% permukaan tertutup air.",
      "Memiliki 1 satelit: Bulan."
    ],
    warna: "#2e8bff"
  },
  mars: {
    nama: "Mars",
    tipe: "Planet Terestrial",
    diameter: "6.779 km",
    massa: "6.42 × 10^23 kg",
    jarak: "227 juta km",
    orbit: "687 hari",
    rotasi: "24,6 jam",
    suhu: "-125°C hingga 20°C",
    fakta: [
      "Planet Merah.",
      "Olympus Mons tertinggi di Tata Surya.",
      "Memiliki Phobos & Deimos."
    ],
    warna: "#d14c32"
  },
  jupiter: {
    nama: "Jupiter",
    tipe: "Gas Giant",
    diameter: "139.820 km",
    massa: "1.90 × 10^27 kg",
    jarak: "778 juta km",
    orbit: "11,86 tahun",
    rotasi: "9,9 jam",
    suhu: "-145°C",
    fakta: [
      "Planet terbesar.",
      "Bintik Merah Besar.",
      "Memiliki 90+ satelit."
    ],
    warna: "#d9a066"
  },
  saturnus: {
    nama: "Saturnus",
    tipe: "Gas Giant",
    diameter: "116.460 km",
    massa: "5.68 × 10^26 kg",
    jarak: "1,4 miliar km",
    orbit: "29,5 tahun",
    rotasi: "10,7 jam",
    suhu: "-178°C",
    fakta: [
      "Memiliki cincin spektakuler.",
      "Satelit terbesar: Titan."
    ],
    warna: "#f4d28c",
    cincin: true
  }
};

export default async function handler(req, res) {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`planet:${clientIP}`, 30, 60000);
    
    if (!rateLimit.allowed) {
        return error(res, 'Rate limit exceeded', 429);
    }

    trackEndpoint('planet');

    const { name, image, list } = req.query;
    const keys = Object.keys(planetData);

    // Return list
    if (list === "true") {
        return success(res, {
            total: keys.length,
            planets: keys
        }, 'Planet list retrieved');
    }

    // Get planet data
    let planet;
    if (!name) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        planet = planetData[randomKey];
    } else {
        planet = planetData[name.toLowerCase()];
        if (!planet) {
            return error(res, "Planet tidak ditemukan", 404);
        }
    }

    // Return JSON only
    if (image !== "true") {
        return success(res, planet, 'Planet data retrieved');
    }

    // Generate image with canvas
    try {
        const canvas = createCanvas(900, 600);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
        bgGrad.addColorStop(0, "#050510");
        bgGrad.addColorStop(1, "#000000");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 900, 600);

        // Stars
        for (let i = 0; i < 150; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * 900,
                Math.random() * 600,
                Math.random() * 1.5,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "white";
            ctx.fill();
        }

        // Draw planet
        const centerX = 250;
        const centerY = 260;
        const radius = 150;

        // Glow effect
        const glow = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 80);
        glow.addColorStop(0, planet.warna);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 80, 0, Math.PI * 2);
        ctx.fill();

        // Planet body
        const grad = ctx.createRadialGradient(
            centerX - 50,
            centerY - 50,
            50,
            centerX,
            centerY,
            radius
        );
        grad.addColorStop(0, "#ffffff33");
        grad.addColorStop(1, planet.warna);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Saturn rings
        if (planet.cincin) {
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 240, 70, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "#dddddd";
            ctx.lineWidth = 8;
            ctx.stroke();
        }

        // Text info
        ctx.fillStyle = "white";
        ctx.font = "bold 34px Arial, sans-serif";
        ctx.fillText(planet.nama, 510, 120);

        ctx.font = "16px Arial, sans-serif";
        let y = 170;
        const space = 32;

        ctx.fillText(`Foto disamping hanya ilustrasi`, 530, y); y += space;
        ctx.fillText(`Tipe: ${planet.tipe}`, 530, y); y += space;
        ctx.fillText(`Diameter: ${planet.diameter}`, 530, y); y += space;
        ctx.fillText(`Massa: ${planet.massa}`, 530, y); y += space;
        ctx.fillText(`Jarak: ${planet.jarak}`, 530, y); y += space;
        ctx.fillText(`Orbit: ${planet.orbit}`, 530, y); y += space;
        ctx.fillText(`Rotasi: ${planet.rotasi}`, 530, y); y += space;
        ctx.fillText(`Suhu: ${planet.suhu}`, 530, y); y += space;

        y += 10;
        ctx.fillText("Fakta:", 530, y); y += space;

        planet.fakta.forEach(f => {
            ctx.fillText("• " + f, 530, y);
            y += 26;
        });

        const buffer = canvas.toBuffer('image/png');
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(buffer);

    } catch (err) {
        console.error('Planet Image Error:', err);
        return error(res, 'Failed to generate image', 500);
    }
      }
  

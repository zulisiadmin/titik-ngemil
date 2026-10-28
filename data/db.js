/*
 * Titik Ngemil - Dataset kanonik (canonical dataset)
 * Format UMD: bisa dipakai di browser (window.TITIK_DB) maupun Node (module.exports).
 * File ini adalah sumber data untuk situs statis, dan sumber untuk membuat seed.sql (D1).
 */
(function (root, factory) {
  var DB = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = DB;
  if (typeof root !== "undefined") root.TITIK_DB = DB;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var EVENT = {
    id: "tn-2026-01",
    slug: "titik-ngemil-1",
    edition: 1,
    name: { id: "Titik Ngemil #1", en: "Titik Ngemil #1" },
    theme: { id: "Rapi Rasa Gondangdia", en: "Tidy Tastes of Gondangdia" },
    date: "2026-10-30",
    dayLabel: { id: "Jumat", en: "Friday" },
    startTime: "14:00",
    endTime: "22:00",
    venueName: { id: "Lorong Srikaya, Gondangdia", en: "Srikaya Lane, Gondangdia" },
    address: "Jl. Srikaya II, Kebon Sirih, Kec. Menteng, Jakarta Pusat 10340",
    city: "Jakarta Pusat",
    mapsUrl: "https://maps.google.com/?q=Stasiun+Gondangdia+Jakarta",
    status: "published",
    hashtag: "#TitikNgemil",
    transport: [
      { icon: "🚉", label: { id: "KRL - Stasiun Gondangdia (langsung)", en: "Commuter Line - Gondangdia Station (direct)" } },
      { icon: "🚌", label: { id: "TransJakarta / Mikrotrans Menteng", en: "TransJakarta / Menteng Microtrans" } },
      { icon: "🛵", label: { id: "Ojek online - titik drop off sisi selatan", en: "Ride-hailing - drop off at south side" } },
      { icon: "🚗", label: { id: "Parkir terbatas di sekitar Jl. Srikaya", en: "Limited parking around Jl. Srikaya" } }
    ]
  };

  var CATEGORIES = [
    { id: "kuliner", name: { id: "Kuliner", en: "Food" }, icon: "🍜", color: "#ff6b35" },
    { id: "minuman", name: { id: "Minuman", en: "Drinks" }, icon: "🥤", color: "#3aa8c1" },
    { id: "jajanan", name: { id: "Jajanan", en: "Street Snacks" }, icon: "🥟", color: "#f4a259" },
    { id: "dessert", name: { id: "Dessert", en: "Dessert" }, icon: "🍧", color: "#c77dff" },
    { id: "nonfood", name: { id: "Non-Food", en: "Non-Food" }, icon: "🛍️", color: "#7bb662" }
  ];

  // Denah peta: kanvas 820 x 1360 (viewBox). Satu titik = satu lorong = satu zona.
  // Booth disusun dua kolom mengapit jalan tengah (lorong) yang membujur ke bawah,
  // supaya nama tenant masih terbaca saat peta diperkecil.
  var ZONES = [
    {
      id: "srikaya", mapKey: "srikaya", type: "outdoor", color: "#06d6a0",
      name: { id: "Lorong Srikaya", en: "Srikaya Lane" },
      blurb: { id: "Satu lorong kuliner: 24 booth mengapit jalan tengah.", en: "One food lane: 24 booths along a central walkway." },
      area: { x: 20, y: 20, w: 780, h: 1320 }
    }
  ];

  // Stall: satu lapak = satu tenant (1:1). Nomor booth 1..24 = B01..B24.
  // Kolom kiri: B01–B12 · Kolom kanan: B13–B24.
  var STALLS = (function () {
    var out = [];
    var W = 268, H = 88, PITCH = 104, Y0 = 56;
    var LEFT_X = 46, RIGHT_X = 506;
    for (var i = 0; i < 24; i++) {
      var col = i < 12 ? 0 : 1;      // 0 = kiri, 1 = kanan
      var row = i % 12;
      var n = i + 1;
      out.push({
        code: "B" + (n < 10 ? "0" : "") + n,
        zoneId: "srikaya",
        label: "Booth " + n,
        x: col === 0 ? LEFT_X : RIGHT_X,
        y: Y0 + row * PITCH,
        w: W,
        h: H
      });
    }
    return out;
  })();

  function m(name, price, descId, descEn, signature) {
    return { name: name, price: price, desc: { id: descId, en: descEn }, signature: !!signature, available: true };
  }

  var TENANTS = [
    {
      slug: "kopi-titik-ngemil", brand: "Kopi Titik Ngemil", categoryId: "minuman", zoneId: "srikaya", stallCode: "B01",
      tagline: { id: "Kopi susu gula aren khas Gondangdia", en: "Gondangdia's signature palm-sugar milk coffee" },
      desc: { id: "Kopi susu gula aren dengan biji lokal, diseduh langsung di depan pengunjung.", en: "Palm-sugar milk coffee with local beans, brewed right in front of you." },
      story: { id: "Dimulai dari gerobak kopi keliling di sekitar stasiun sejak 2019.", en: "Started as a mobile coffee cart around the station in 2019." },
      instagram: "kopititikngemil", whatsapp: "081200000101", halal: true, tags: ["kopi", "signature"],
      menu: [
        m("Kopi Susu Gula Aren", 18000, "Kopi susu manis legit", "Sweet palm-sugar milk coffee", true),
        m("Americano Dingin", 15000, "Kopi hitam dingin", "Iced black coffee", false),
        m("Kopi Tubruk Klasik", 12000, "Kopi tubruk tradisional", "Traditional brewed coffee", false),
        m("Es Cokelat", 17000, "Cokelat dingin creamy", "Creamy iced chocolate", false)
      ]
    },
    {
      slug: "es-teh-jumbo", brand: "Es Teh Jumbo Pakde", categoryId: "minuman", zoneId: "srikaya", stallCode: "B02",
      tagline: { id: "Segelas sejumbo seember, harga kaki lima", en: "Giant glass, street-side price" },
      desc: { id: "Es teh manis ukuran jumbo, favorit pelepas dahaga commuter.", en: "Jumbo sweet iced tea, a commuter favorite." },
      story: { id: "Legendaris di trotoar Gondangdia sebelum penataan.", en: "A Gondangdia sidewalk legend before the rearrangement." },
      instagram: "estehjumbopakde", whatsapp: "081200000102", halal: true, tags: ["murah", "jumbo"],
      menu: [
        m("Es Teh Manis Jumbo", 8000, "Ukuran 1 liter", "1 litre size", true),
        m("Es Teh Tawar Jumbo", 6000, "Tanpa gula", "Without sugar", false),
        m("Es Lemon Tea", 12000, "Teh lemon segar", "Fresh lemon tea", false)
      ]
    },
    {
      slug: "kue-cubit-rangi-bu-iyem", brand: "Kue Cubit & Kue Rangi Bu Iyem", categoryId: "jajanan", zoneId: "srikaya", stallCode: "B03",
      tagline: { id: "Jajanan pasar yang bikin kangen", en: "Traditional snacks that bring nostalgia" },
      desc: { id: "Kue cubit setengah matang dan kue rangi kelapa bakar.", en: "Half-cooked mini pancakes and grilled coconut wafers." },
      story: { id: "Resep warisan tiga generasi keluarga Bu Iyem.", en: "A recipe passed down through three generations." },
      instagram: "kuecubitbu.iyem", whatsapp: "081200000103", halal: true, tags: ["tradisional", "manis"],
      menu: [
        m("Kue Cubit Setengah Matang", 12000, "Isi 6, topping meises", "6 pcs with chocolate sprinkles", true),
        m("Kue Rangi Kelapa", 10000, "Kelapa bakar gula jawa", "Grilled coconut with palm sugar", false),
        m("Kue Cubit Keju", 15000, "Topping keju melimpah", "Loaded cheese topping", false)
      ]
    },
    {
      slug: "titik-merch-store", brand: "Titik Merch Store", categoryId: "nonfood", zoneId: "srikaya", stallCode: "B04",
      tagline: { id: "Suvenir resmi Titik Ngemil", en: "Official Titik Ngemil merchandise" },
      desc: { id: "Kaus, totebag, dan pin edisi perdana event.", en: "T-shirts, totes, and pins from the debut edition." },
      story: { id: "Hasil kolaborasi dengan perajin lokal Menteng.", en: "Made in collaboration with local Menteng artisans." },
      instagram: "titikngemil.store", whatsapp: "081200000104", halal: false, tags: ["merch", "souvenir"],
      menu: [
        m("Kaus Titik Ngemil", 95000, "Katun combed 30s", "Combed cotton 30s", true),
        m("Totebag Kanvas", 55000, "Kanvas tebal", "Heavy canvas", false),
        m("Pin Enamel", 25000, "Pin logam edisi terbatas", "Limited enamel pin", false)
      ]
    },

    {
      slug: "sate-ayam-pak-kumis", brand: "Sate Ayam Pak Kumis", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B05",
      tagline: { id: "Sate ayam madura, bumbu kacang pekat", en: "Madura chicken satay, rich peanut sauce" },
      desc: { id: "Sate ayam bakar arang dengan bumbu kacang khas Madura.", en: "Charcoal-grilled chicken satay with Madura peanut sauce." },
      story: { id: "50 tusuk per porsi, dibakar setelah dipesan.", en: "Grilled to order." },
      instagram: "satepakumis", whatsapp: "081200000105", halal: true, tags: ["bakar", "halal"],
      menu: [
        m("Sate Ayam (10 tusuk)", 30000, "Plus lontong", "With rice cake", true),
        m("Sate Ayam (5 tusuk)", 18000, "Porsi kecil", "Small portion", false),
        m("Lontong", 5000, "Lontong tambahan", "Extra rice cake", false)
      ]
    },
    {
      slug: "bakso-urat-mas-yanto", brand: "Bakso Urat Mas Yanto", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B06",
      tagline: { id: "Bakso urat sapi, kuah kaldu gurih", en: "Beef tendon meatballs, savory broth" },
      desc: { id: "Bakso urat sapi dengan kuah kaldu sapi asli dan mie kuning.", en: "Beef tendon meatballs in authentic beef broth with noodles." },
      story: { id: "Kuah direbus sejak subuh setiap hari.", en: "Broth simmered from dawn daily." },
      instagram: "baksomasyanto", whatsapp: "081200000106", halal: true, tags: ["kuah", "sapi"],
      menu: [
        m("Bakso Urat Campur", 25000, "Bakso + mie + tahu", "Meatballs + noodles + tofu", true),
        m("Bakso Urat Saja", 20000, "5 butir bakso", "5 meatballs", false),
        m("Mie Ayam Bakso", 23000, "Mie ayam + bakso", "Chicken noodles + meatball", false)
      ]
    },
    {
      slug: "nasi-goreng-gila-bang-jek", brand: "Nasi Goreng Gila Bang Jek", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B07",
      tagline: { id: "Nasgor pedas level gila", en: "Crazy-spicy fried rice" },
      desc: { id: "Nasi goreng dengan sosis, ayam, telur, dan sambal pedas.", en: "Fried rice with sausage, chicken, egg, and spicy chili." },
      story: { id: "Menu favorit anak kos sekitar Menteng.", en: "A favorite among Menteng students." },
      instagram: "nasgorgilabangjek", whatsapp: "081200000107", halal: true, tags: ["pedas", "nasgor"],
      menu: [
        m("Nasi Goreng Gila", 25000, "Lengkap, pedas", "Complete, spicy", true),
        m("Nasi Goreng Biasa", 18000, "Tanpa sosis", "No sausage", false),
        m("Kwetiau Goreng", 23000, "Kwetiau pedas", "Spicy flat noodles", false)
      ]
    },
    {
      slug: "sate-taichan-gondangdia", brand: "Sate Taichan Gondangdia", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B08",
      tagline: { id: "Tanpa bumbu kacang, sambal pedas", en: "No peanut sauce, just spicy sambal" },
      desc: { id: "Sate ayam tanpa bumbu kacang, disajikan dengan sambal dan jeruk nipis.", en: "Chicken satay without peanut sauce, served with sambal and lime." },
      story: { id: "Tren sate taichan yang hits di kalangan muda.", en: "The trendy taichan satay popular with young crowds." },
      instagram: "sate.taichan.gdd", whatsapp: "081200000108", halal: true, tags: ["pedas", "bakar"],
      menu: [
        m("Sate Taichan (10 tusuk)", 30000, "Plus lontong", "With rice cake", true),
        m("Sate Taichan (5 tusuk)", 18000, "Porsi kecil", "Small portion", false),
        m("Sambal Extra", 3000, "Sambal pedas tambahan", "Extra spicy sambal", false)
      ]
    },
    {
      slug: "mie-ayam-jamur-pak-agus", brand: "Mie Ayam Jamur Pak Agus", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B09",
      tagline: { id: "Mie ayam jamur, pangsit goreng", en: "Mushroom chicken noodles with fried wontons" },
      desc: { id: "Mie ayam dengan topping jamur dan pangsit goreng renyah.", en: "Chicken noodles topped with mushrooms and crispy fried wontons." },
      story: { id: "Gerobak keluarga sejak 2008.", en: "A family cart since 2008." },
      instagram: "mieayampakagus", whatsapp: "081200000109", halal: true, tags: ["mie", "pangsit"],
      menu: [
        m("Mie Ayam Jamur", 22000, "Plus pangsit goreng", "With fried wontons", true),
        m("Mie Ayam Original", 18000, "Tanpa jamur", "No mushroom", false),
        m("Pangsit Goreng", 8000, "5 buah", "5 pieces", false)
      ]
    },
    {
      slug: "ketoprak-bu-nani", brand: "Ketoprak Bu Nani", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B10",
      tagline: { id: "Ketoprak Betawi, bumbu kacang ulek", en: "Betawi ketoprak, hand-ground peanut sauce" },
      desc: { id: "Ketoprak tahu, bihun, dan lontong dengan bumbu kacang ulek kasar.", en: "Tofu, vermicelli, and rice cake with coarsely ground peanut sauce." },
      story: { id: "Bumbu diulek langsung di depan pembeli.", en: "Sauce ground fresh in front of customers." },
      instagram: "ketoprakbunani", whatsapp: "081200000110", halal: true, tags: ["sehat", "tradisional"],
      menu: [
        m("Ketoprak Lengkap", 20000, "Plus telur", "With egg", true),
        m("Ketoprak Biasa", 15000, "Tanpa telur", "No egg", false),
        m("Gado-Gado", 22000, "Sayur segar", "Fresh vegetables", false)
      ]
    },

    {
      slug: "martabak-bang-doel", brand: "Martabak Bang Doel", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B11",
      tagline: { id: "Martabak telor & manis jumbo", en: "Giant savory & sweet martabak" },
      desc: { id: "Martabak telor isi daging dan martabak manis aneka topping.", en: "Meat-filled savory martabak and sweet martabak with assorted toppings." },
      story: { id: "Antrean panjang setiap akhir pekan.", en: "Long queues every weekend." },
      instagram: "martabakbangdoel", whatsapp: "081200000111", halal: true, tags: ["manis", "gurih"],
      menu: [
        m("Martabak Telor", 35000, "Isi daging + daun bawang", "Meat + scallion filling", true),
        m("Martabak Manis Cokelat Keju", 40000, "Topping cokelat & keju", "Chocolate & cheese", true),
        m("Martabak Manis Kacang", 30000, "Kacang sangrai", "Roasted peanut", false)
      ]
    },
    {
      slug: "pempek-yu-nina", brand: "Pempek Yu Nina", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B12",
      tagline: { id: "Pempek Palembang asli, cuko mantap", en: "Authentic Palembang pempek, bold vinegar sauce" },
      desc: { id: "Pempek kapal selam, lenjer, dan adaan dengan cuko pedas manis.", en: "Submarine, lenjer, and adaan pempek with sweet-spicy vinegar sauce." },
      story: { id: "Dibuat fresh dari ikan tenggiri.", en: "Made fresh from mackerel." },
      instagram: "pempekyunina", whatsapp: "081200000112", halal: true, tags: ["ikan", "cuko"],
      menu: [
        m("Paket Pempek Campur", 35000, "5 jenis pempek + cuko", "5 pempek types + sauce", true),
        m("Pempek Kapal Selam", 18000, "Isi telur", "Egg-filled", false),
        m("Pempek Lenjer", 12000, "2 buah", "2 pieces", false)
      ]
    },
    {
      slug: "siomay-batagor-abang-ican", brand: "Siomay & Batagor Abang Ican", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B13",
      tagline: { id: "Siomay kukus & batagor goreng", en: "Steamed siomay & fried batagor" },
      desc: { id: "Siomay ikan kukus dan batagor goreng dengan saus kacang.", en: "Steamed fish dumplings and fried batagor with peanut sauce." },
      story: { id: "Tiga dekade jualan di Menteng.", en: "Three decades selling in Menteng." },
      instagram: "siomayabangican", whatsapp: "081200000113", halal: true, tags: ["kukus", "goreng"],
      menu: [
        m("Siomay Lengkap", 22000, "Kentang, tahu, telur, kol", "Potato, tofu, egg, cabbage", true),
        m("Batagor Goreng", 20000, "5 buah", "5 pieces", false),
        m("Siomay + Batagor", 25000, "Kombinasi", "Combination", false)
      ]
    },
    {
      slug: "kerak-telor-betawi-zaki", brand: "Kerak Telor Betawi Zaki", categoryId: "jajanan", zoneId: "srikaya", stallCode: "B14",
      tagline: { id: "Kerak telor betawi otentik", en: "Authentic Betawi kerak telor" },
      desc: { id: "Kerak telor dengan beras ketan, telur bebek, dan serundeng.", en: "Kerak telor with glutinous rice, duck egg, and coconut floss." },
      story: { id: "Dibuat di atas wajan arang, ala Betawi asli.", en: "Cooked on a charcoal pan, truly Betawi style." },
      instagram: "keraktelorzaki", whatsapp: "081200000114", halal: true, tags: ["betawi", "otentik"],
      menu: [
        m("Kerak Telor Telur Bebek", 25000, "Serundeng & bawang goreng", "Coconut floss & fried shallots", true),
        m("Kerak Telor Telur Ayam", 20000, "Versi telur ayam", "Chicken egg version", false)
      ]
    },
    {
      slug: "pisang-goreng-keju-munir", brand: "Pisang Goreng Keju Munir", categoryId: "jajanan", zoneId: "srikaya", stallCode: "B15",
      tagline: { id: "Pisang goreng crispy topping keju", en: "Crispy banana fritters with cheese" },
      desc: { id: "Pisang goreng renyah dengan topping keju, cokelat, dan susu.", en: "Crispy banana fritters topped with cheese, chocolate, and milk." },
      story: { id: "Camilan favorit sore hari.", en: "A favorite afternoon snack." },
      instagram: "pisanggorengmunir", whatsapp: "081200000115", halal: true, tags: ["goreng", "keju"],
      menu: [
        m("Pisang Goreng Keju", 18000, "Topping keju & susu", "Cheese & milk topping", true),
        m("Pisang Goreng Cokelat", 17000, "Topping cokelat", "Chocolate topping", false),
        m("Paket Mix (6 pcs)", 30000, "Aneka topping", "Assorted toppings", false)
      ]
    },
    {
      slug: "cendol-dawet-ayu-mbok-sri", brand: "Cendol & Dawet Ayu Mbok Sri", categoryId: "dessert", zoneId: "srikaya", stallCode: "B16",
      tagline: { id: "Cendol & dawet ayu segar", en: "Fresh cendol & dawet ayu" },
      desc: { id: "Es cendol gula jawa dan dawet ayu santan, pelepas dahaga.", en: "Palm-sugar cendol and coconut dawet, refreshing." },
      story: { id: "Resep dawet dari Banjarnegara.", en: "A dawet recipe from Banjarnegara." },
      instagram: "cendolmboksri", whatsapp: "081200000116", halal: true, tags: ["dingin", "segar"],
      menu: [
        m("Es Cendol Gula Jawa", 15000, "Porsi jumbo", "Jumbo portion", true),
        m("Dawet Ayu Santan", 15000, "Santan kental", "Rich coconut milk", false),
        m("Es Campur", 20000, "Aneka isian", "Assorted fillings", false)
      ]
    },
    {
      slug: "tahu-gejrot-cirebon", brand: "Tahu Gejrot Cirebon", categoryId: "jajanan", zoneId: "srikaya", stallCode: "B17",
      tagline: { id: "Tahu gejrot kuah asam pedas manis", en: "Tahu gejrot in sweet-sour-spicy broth" },
      desc: { id: "Tahu pong digoreng, disiram kuah gula jawa, cabai, dan bawang.", en: "Fried puffed tofu in palm sugar, chili, and shallot broth." },
      story: { id: "Kuah diulek dadakan sesuai pesanan.", en: "Broth ground to order." },
      instagram: "tahugejrotcirebon", whatsapp: "081200000117", halal: true, tags: ["pedas", "asam"],
      menu: [
        m("Tahu Gejrot Original", 12000, "Kuah asam pedas", "Sweet-sour-spicy broth", true),
        m("Tahu Gejrot Jumbo", 18000, "Porsi besar", "Large portion", false)
      ]
    },
    {
      slug: "risoles-pastel-bu-tuti", brand: "Risoles & Pastel Bu Tuti", categoryId: "jajanan", zoneId: "srikaya", stallCode: "B18",
      tagline: { id: "Risoles & pastel goreng homemade", en: "Homemade fried risoles & pastel" },
      desc: { id: "Risoles isi ragout ayam dan pastel sayur, digoreng fresh.", en: "Chicken ragout risoles and veggie pastel, fried fresh." },
      story: { id: "Dibuat setiap pagi di rumah Bu Tuti.", en: "Made every morning at Bu Tuti's home." },
      instagram: "risolesbututi", whatsapp: "081200000118", halal: true, tags: ["goreng", "homemade"],
      menu: [
        m("Risoles Mayo (5 pcs)", 20000, "Isi ragout ayam", "Chicken ragout filling", true),
        m("Pastel Sayur (4 pcs)", 16000, "Isi sayur & bihun", "Veggie & vermicelli filling", false),
        m("Paket Mix (8 pcs)", 30000, "Risoles + pastel", "Risoles + pastel", false)
      ]
    },

    {
      slug: "soto-betawi-h-mamat", brand: "Soto Betawi H. Mamat", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B19",
      tagline: { id: "Soto betawi kuah santan", en: "Betawi soto with coconut milk broth" },
      desc: { id: "Soto daging sapi kuah santan dengan kentang dan tomat.", en: "Beef soto in coconut milk broth with potato and tomato." },
      story: { id: "Meracik kuah sejak 1995.", en: "Cooking the broth since 1995." },
      instagram: "sotobetawihmamat", whatsapp: "081200000119", halal: true, tags: ["santan", "daging"],
      menu: [
        m("Soto Betawi Daging", 35000, "Plus nasi & emping", "With rice & crackers", true),
        m("Soto Betawi Ayam", 28000, "Versi ayam", "Chicken version", false),
        m("Nasi Tambahan", 6000, "Nasi putih", "Steamed rice", false)
      ]
    },
    {
      slug: "gado-gado-mbok-nah", brand: "Gado-Gado Mbok Nah", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B20",
      tagline: { id: "Gado-gado sayur segar", en: "Gado-gado with fresh vegetables" },
      desc: { id: "Gado-gado sayur, tahu, tempe, dan lontong dengan bumbu kacang.", en: "Vegetables, tofu, tempeh, and rice cake with peanut sauce." },
      story: { id: "Sayur dipetik dari pasar pagi.", en: "Vegetables sourced from the morning market." },
      instagram: "gadogadomboknah", whatsapp: "081200000120", halal: true, tags: ["vegetarian", "segar"],
      menu: [
        m("Gado-Gado Lengkap", 22000, "Plus lontong & kerupuk", "With rice cake & crackers", true),
        m("Gado-Gado Sayur", 18000, "Tanpa lontong", "No rice cake", false),
        m("Karedok", 20000, "Sayur mentah bumbu kacang", "Raw veggies, peanut sauce", false)
      ]
    },
    {
      slug: "es-kelapa-muda-segar", brand: "Es Kelapa Muda Segar", categoryId: "minuman", zoneId: "srikaya", stallCode: "B21",
      tagline: { id: "Kelapa muda asli, dingin menyegarkan", en: "Real young coconut, refreshingly cold" },
      desc: { id: "Es kelapa muda dengan daging kelapa utuh dan gula batu.", en: "Young coconut ice with full coconut meat and rock sugar." },
      story: { id: "Kelapa datang langsung dari pasar Indramayu.", en: "Coconuts arrive fresh from Indramayu market." },
      instagram: "eskelapamudasegar", whatsapp: "081200000121", halal: true, tags: ["dingin", "asli"],
      menu: [
        m("Es Kelapa Muda", 15000, "Kelapa utuh", "Full coconut", true),
        m("Es Kelapa Sirup", 17000, "Plus sirup gula", "With sugar syrup", false),
        m("Es Kelapa Jeruk Nipis", 18000, "Perasan jeruk nipis", "Squeezed lime", false)
      ]
    },
    {
      slug: "polaroid-foto-kenangan", brand: "Polaroid & Foto Kenangan", categoryId: "nonfood", zoneId: "srikaya", stallCode: "B22",
      tagline: { id: "Abadikan momen ngemil kamu", en: "Capture your snacking moments" },
      desc: { id: "Foto polaroid instan dengan latar panggung Titik Ngemil.", en: "Instant polaroid photos with the Titik Ngemil backdrop." },
      story: { id: "Layanan foto untuk kenang-kenangan event.", en: "Photo service for event keepsakes." },
      instagram: "titikngemil.photo", whatsapp: "081200000122", halal: false, tags: ["foto", "kenang-kenangan"],
      menu: [
        m("Foto Polaroid", 25000, "1 lembar + frame", "1 photo + frame", true),
        m("Foto Polaroid Strip (2)", 40000, "2 lembar", "2 photos", false),
        m("Cetak Foto A4", 35000, "Cetak satuan", "Single print", false)
      ]
    },
    {
      slug: "kebab-shawarma-al-arabi", brand: "Kebab & Shawarma Al-Arabi", categoryId: "kuliner", zoneId: "srikaya", stallCode: "B23",
      tagline: { id: "Kebab & shawarma daging melimpah", en: "Loaded kebab & shawarma" },
      desc: { id: "Kebab dan shawarma ayam/sapi dengan saus spesial.", en: "Chicken or beef kebab and shawarma with special sauce." },
      story: { id: "Favorit makan malam para pekerja sekitar.", en: "A dinner favorite for nearby workers." },
      instagram: "kebabalarabi", whatsapp: "081200000123", halal: true, tags: ["daging", "malam"],
      menu: [
        m("Kebab Ayam", 25000, "Isi ayam + sayur", "Chicken + veggies", true),
        m("Shawarma Daging", 30000, "Isi daging sapi", "Beef filling", false),
        m("Kebab Keju Jumbo", 35000, "Extra keju", "Extra cheese", false)
      ]
    },
    {
      slug: "lumpia-semarang-yu-iis", brand: "Lumpia Semarang Yu Iis", categoryId: "jajanan", zoneId: "srikaya", stallCode: "B24",
      tagline: { id: "Lumpia goreng isi rebung", en: "Fried spring rolls with bamboo shoots" },
      desc: { id: "Lumpia isi rebung, ayam, dan telur, saus bawang khas Semarang.", en: "Spring rolls with bamboo shoots, chicken, and egg, Semarang-style." },
      story: { id: "Resep asli Semarang yang dibawa ke Jakarta.", en: "An authentic Semarang recipe brought to Jakarta." },
      instagram: "lumpiayu.iis", whatsapp: "081200000124", halal: true, tags: ["goreng", "rebung"],
      menu: [
        m("Lumpia Rebung (2 pcs)", 20000, "Saus bawang", "Onion sauce", true),
        m("Lumpia Ayam (2 pcs)", 22000, "Isi ayam", "Chicken filling", false),
        m("Paket Mix (4 pcs)", 38000, "Rebung + ayam", "Bamboo + chicken", false)
      ]
    }
  ];

  var SCHEDULE = [
    { id: "s1", time: "14:00", endTime: "14:30", type: "opening", stage: "Lorong Srikaya",
      title: { id: "Opening & Sambutan", en: "Opening & Welcome" },
      desc: { id: "Pembukaan resmi Titik Ngemil #1 bersama perwakilan tenant.", en: "Official opening of Titik Ngemil #1 with tenant representatives." } },
    { id: "s2", time: "15:00", endTime: "16:00", type: "music", stage: "Lorong Srikaya",
      title: { id: "Akustik Sore", en: "Afternoon Acoustic" },
      desc: { id: "Penampilan musisi akustik lokal Menteng.", en: "Local Menteng acoustic musicians." } },
    { id: "s3", time: "16:30", endTime: "17:00", type: "talk", stage: "Lorong Srikaya",
      title: { id: "Talkshow: PKL Naik Kelas", en: "Talkshow: Street Vendors Level Up" },
      desc: { id: "Diskusi penataan PKL bersama pelaku usaha & komunitas.", en: "Discussion on organizing street vendors with businesses & communities." } },
    { id: "s4", time: "17:00", endTime: "18:30", type: "music", stage: "Lorong Srikaya",
      title: { id: "DJ Set Sore", en: "Sunset DJ Set" },
      desc: { id: "Musik santai menemani jam pulang kantor.", en: "Chill music for the commute-home hours." } },
    { id: "s5", time: "18:30", endTime: "19:15", type: "workshop", stage: "Lorong Srikaya",
      title: { id: "Demo Masak: Signature Tenant", en: "Cooking Demo: Tenant Signatures" },
      desc: { id: "Demo masak menu andalan dari tenant pilihan.", en: "Cooking demo of signature dishes from selected tenants." } },
    { id: "s6", time: "19:15", endTime: "20:00", type: "quiz", stage: "Lorong Srikaya",
      title: { id: "Kuis & Doorprize", en: "Quiz & Doorprize" },
      desc: { id: "Kuis berhadiah voucher tenant Titik Ngemil.", en: "Quiz with Titik Ngemil tenant vouchers." } },
    { id: "s7", time: "20:00", endTime: "22:00", type: "music", stage: "Lorong Srikaya",
      title: { id: "Musik Penutup", en: "Closing Music" },
      desc: { id: "Penampilan penutup hingga pasar tutup.", en: "Closing performance until the market closes." } }
  ];

  /* ===================== Multi-titik (lokasi) ===================== */
  // CATATAN: saat ini hanya 1 titik yang aktif. Nama titik bisa diubah admin
  // lewat Dashboard Admin → tab "Titik". Sisanya ditandai "Coming Soon".
  var SITES = [
    {
      id: "gondangdia", slug: "gondangdia", status: "active", city: "Jakarta Pusat",
      name: { id: "Lorong Srikaya", en: "Srikaya Lane" },
      blurb: { id: "Satu lorong, 24 booth. Titik perdana Titik Ngemil.", en: "One lane, 24 booths. Titik Ngemil's debut point." },
      address: "Jl. Srikaya II, Kebon Sirih, Kec. Menteng, Jakarta Pusat 10340",
      mapsUrl: "https://maps.google.com/?q=Stasiun+Gondangdia+Jakarta",
      capacity: 24, days: ["jumat"],
      openTime: "14:00", closeTime: "22:00",
      launchDate: "2026-10-30"
    },
    {
      id: "next-1", slug: "next-1", status: "pending", city: "—",
      name: { id: "Titik Berikutnya", en: "Next Point" },
      blurb: { id: "Coming soon.", en: "Coming soon." },
      address: "", mapsUrl: "",
      capacity: 24, days: [], openTime: "", closeTime: "", launchDate: null
    },
    {
      id: "next-2", slug: "next-2", status: "pending", city: "—",
      name: { id: "Titik Berikutnya", en: "Next Point" },
      blurb: { id: "Coming soon.", en: "Coming soon." },
      address: "", mapsUrl: "",
      capacity: 24, days: [], openTime: "", closeTime: "", launchDate: null
    },
    {
      id: "next-3", slug: "next-3", status: "pending", city: "—",
      name: { id: "Titik Berikutnya", en: "Next Point" },
      blurb: { id: "Coming soon.", en: "Coming soon." },
      address: "", mapsUrl: "",
      capacity: 24, days: [], openTime: "", closeTime: "", launchDate: null
    }
  ];

  // Hari operasional: event perdana hanya 1 hari (Jumat).
  // Hari lain tetap ada (closed) supaya admin bisa mengaktifkan untuk event berikutnya.
  var DAYS = [
    { id: "senin", label: { id: "Senin", en: "Monday" }, closed: true },
    { id: "selasa", label: { id: "Selasa", en: "Tuesday" }, closed: true },
    { id: "rabu", label: { id: "Rabu", en: "Wednesday" }, closed: true },
    { id: "kamis", label: { id: "Kamis", en: "Thursday" }, closed: true },
    { id: "jumat", label: { id: "Jumat", en: "Friday" } },
    { id: "sabtu", label: { id: "Sabtu", en: "Saturday" }, closed: true },
    { id: "minggu", label: { id: "Minggu", en: "Sunday" }, closed: true }
  ];

  // Pola rotasi (dipakai untuk "Jadwal Rotasi & Slot")
  var ROTATION_PATTERNS = {
    eventDay: ["jumat"]
  };

  // Nomor booth 1..N mengikuti urutan lapak
  STALLS.forEach(function (s, i) { s.no = i + 1; s.boothStatus = "buka"; });

  // Semua tenant tampil di hari event (Jumat) + status booth operasional
  TENANTS.forEach(function (t, i) {
    t.days = ["jumat"];
    t.boothStatus = i % 7 === 0 ? "tutup" : (i % 11 === 0 ? "habis" : "buka");
    t.verification = "disetujui"; // disetujui | perlu-revisi | ditolak | ditinjau | terkirim
  });

  // Contoh data pendaftaran (untuk demo alur status)
  var APPLICATIONS = [
    {
      id: "APP-2026-0001", brand_name: "Nasi Uduk Bu Yati", category: "Kuliner",
      contact_name: "Yati Sumiati", phone: "081311112222", email: "yati@email.com",
      pitch: "Nasi uduk betawi dengan lauk lengkap, sudah berjualan di Menteng 6 tahun.",
      preferred_zone: "Lorong Srikaya", stage: "verifikasi", site: "gondangdia", booth: null,
      note: "", submitted_at: "2026-10-25"
    },
    {
      id: "APP-2026-0002", brand_name: "Es Doger Kampung", category: "Dessert",
      contact_name: "Rahmat Hidayat", phone: "081333334444", email: "rahmat@email.com",
      pitch: "Es doger resep keluarga, cocok untuk sore hari.",
      preferred_zone: "Lorong Srikaya", stage: "ditinjau", site: "gondangdia", booth: null,
      note: "", submitted_at: "2026-10-26"
    },
    {
      id: "APP-2026-0003", brand_name: "Ayam Geprek Juara", category: "Kuliner",
      contact_name: "Dedi Kurniawan", phone: "081355556666", email: "dedi@email.com",
      pitch: "Ayam geprek sambal bawang level 1-5.",
      preferred_zone: "Lorong Srikaya", stage: "perlu-revisi", site: "gondangdia", booth: null,
      note: "Foto dapur & sertifikat halal belum dilampirkan.", submitted_at: "2026-10-24"
    },
    {
      id: "APP-2026-0004", brand_name: "Kopi Rakyat Senja", category: "Minuman",
      contact_name: "Sinta Maharani", phone: "081377778888", email: "sinta@email.com",
      pitch: "Kopi susu gula aren & manual brew dengan biji lokal.",
      preferred_zone: "Lorong Srikaya", stage: "disetujui", site: "gondangdia", booth: 7,
      note: "", submitted_at: "2026-10-20"
    }
  ];

  return {
    updatedAt: "2026-10-27",
    sites: SITES,
    activeSite: "gondangdia",
    days: DAYS,
    rotationPatterns: ROTATION_PATTERNS,
    event: EVENT,
    categories: CATEGORIES,
    zones: ZONES,
    stalls: STALLS,
    tenants: TENANTS,
    applications: APPLICATIONS,
    schedule: SCHEDULE
  };
});
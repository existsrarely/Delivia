/**
 * DELIVIA - Route Intelligence & Mock Dataset
 * Real-world Indian Expressway Routes, Safe Pull-Over Points, Partner Restaurants, and Runners
 */

const DELIVIA_DATA = {
  routes: [
    {
      id: 'yamuna_exp',
      name: 'Yamuna Expressway (Delhi to Agra)',
      shortName: 'Delhi → Agra',
      highway: 'Yamuna Expressway (NH-19 / Taj Exp)',
      totalDistanceKm: 165,
      avgSpeedKmph: 85,
      estimatedTotalTimeMin: 115,
      origin: { name: 'Greater Noida Zero Point, Delhi NCR', lat: 28.4744, lng: 77.5040 },
      destination: { name: 'Agra Outer Ring Road, Agra', lat: 27.1767, lng: 78.0081 },
      waypoints: [
        { name: 'Greater Noida Zero Point', lat: 28.4744, lng: 77.5040, km: 0 },
        { name: 'Jewar Toll Plaza', lat: 28.1633, lng: 77.5891, km: 38 },
        { name: 'Tappal Interchange Lay-by', lat: 27.9352, lng: 77.6712, km: 68 },
        { name: 'Nauchandi Food Complex Bay', lat: 27.7601, lng: 77.7345, km: 92 },
        { name: 'Mathura Toll Plaza & Rest Area', lat: 27.5255, lng: 77.7890, km: 122 },
        { name: 'Khandauli Food Plaza', lat: 27.3204, lng: 77.8921, km: 148 },
        { name: 'Agra Toll Plaza (Final)', lat: 27.1767, lng: 78.0081, km: 165 }
      ],
      polyline: [
        [28.4744, 77.5040],
        [28.3850, 77.5300],
        [28.2700, 77.5600],
        [28.1633, 77.5891],
        [28.0500, 77.6300],
        [27.9352, 77.6712],
        [27.8400, 77.7050],
        [27.7601, 77.7345],
        [27.6400, 77.7600],
        [27.5255, 77.7890],
        [27.4200, 77.8400],
        [27.3204, 77.8921],
        [27.2400, 77.9500],
        [27.1767, 78.0081]
      ]
    },
    {
      id: 'mumbai_pune',
      name: 'Mumbai–Pune Expressway',
      shortName: 'Mumbai → Pune',
      highway: 'Yashwantrao Chavan Expressway',
      totalDistanceKm: 94,
      avgSpeedKmph: 75,
      estimatedTotalTimeMin: 75,
      origin: { name: 'Kalamboli, Navi Mumbai', lat: 19.0144, lng: 73.1022 },
      destination: { name: 'Wakad / Kiwale, Pune', lat: 18.6492, lng: 73.7438 },
      waypoints: [
        { name: 'Kalamboli Entry Gate', lat: 19.0144, lng: 73.1022, km: 0 },
        { name: 'Khalapur Toll Plaza', lat: 18.8152, lng: 73.2844, km: 32 },
        { name: 'Lonavala Food Mall Bay', lat: 18.7557, lng: 73.4091, km: 55 },
        { name: 'Talegaon Lay-by Station', lat: 18.7180, lng: 73.6550, km: 78 },
        { name: 'Urse Toll Plaza, Pune', lat: 18.6492, lng: 73.7438, km: 94 }
      ],
      polyline: [
        [19.0144, 73.1022],
        [18.9200, 73.1800],
        [18.8152, 73.2844],
        [18.7750, 73.3400],
        [18.7557, 73.4091],
        [18.7350, 73.5200],
        [18.7180, 73.6550],
        [18.6800, 73.7000],
        [18.6492, 73.7438]
      ]
    },
    {
      id: 'blr_mysuru',
      name: 'Bengaluru–Mysuru Expressway',
      shortName: 'Bengaluru → Mysuru',
      highway: 'NH-275 Expressway',
      totalDistanceKm: 118,
      avgSpeedKmph: 80,
      estimatedTotalTimeMin: 90,
      origin: { name: 'Kengeri Toll, Bengaluru', lat: 12.8997, lng: 77.4827 },
      destination: { name: 'Columbia Asia Circle, Mysuru', lat: 12.3375, lng: 76.6572 },
      waypoints: [
        { name: 'Kengeri Terminal', lat: 12.8997, lng: 77.4827, km: 0 },
        { name: 'Bidadi Smart Rest Bay', lat: 12.7981, lng: 77.3820, km: 28 },
        { name: 'Ramanagara Silk Food Hub', lat: 12.7209, lng: 77.2799, km: 48 },
        { name: 'Mandya Highway Lay-by', lat: 12.5218, lng: 76.8951, km: 82 },
        { name: 'Srirangapatna Heritage Plaza', lat: 12.4220, lng: 76.6947, km: 104 },
        { name: 'Mysuru City Entry', lat: 12.3375, lng: 76.6572, km: 118 }
      ],
      polyline: [
        [12.8997, 77.4827],
        [12.8400, 77.4200],
        [12.7981, 77.3820],
        [12.7500, 77.3300],
        [12.7209, 77.2799],
        [12.6200, 77.0800],
        [12.5218, 76.8951],
        [12.4600, 76.7800],
        [12.4220, 76.6947],
        [12.3375, 76.6572]
      ]
    }
  ],

  handoffPoints: [
    {
      id: 'hp_yamuna_1',
      routeId: 'yamuna_exp',
      name: 'HP Safe Lay-by Bay #2 (Jewar Cut, Km 42)',
      shortName: 'Jewar Bay #2',
      highwayKm: 42,
      lat: 28.1400,
      lng: 77.6000,
      type: 'Lay-by Bay & Fuel Hub',
      laneInstruction: 'Left designated slow lane (Bay 2)',
      safeSpeedThresholdKmph: 5,
      facilities: ['Covered Parking Bay', 'Security Cameras', 'Quick Restroom', 'Water Refill'],
      runnerCapacity: 3
    },
    {
      id: 'hp_yamuna_2',
      routeId: 'yamuna_exp',
      name: 'IndianOil Highway Oasis (Tappal Interchange, Km 70)',
      shortName: 'Tappal Oasis Bay #4',
      highwayKm: 70,
      lat: 27.9250,
      lng: 77.6780,
      type: 'Highway Oasis Plaza',
      laneInstruction: 'Slip road to Food Plaza canopy',
      safeSpeedThresholdKmph: 5,
      facilities: ['Shaded EV/Car Bay', 'Runner Dispatch Station', 'First Aid'],
      runnerCapacity: 4
    },
    {
      id: 'hp_yamuna_3',
      routeId: 'yamuna_exp',
      name: 'Mathura Bypass Safe Pull-Over (Km 124)',
      shortName: 'Mathura Lay-by #1',
      highwayKm: 124,
      lat: 27.5180,
      lng: 77.7950,
      type: 'Toll Lay-by Bay',
      laneInstruction: 'Far-left express pickup shoulder (Bay 1)',
      safeSpeedThresholdKmph: 5,
      facilities: ['CCTV Monitored', 'Solar Canopy', 'Direct Expressway Merge'],
      runnerCapacity: 3
    },
    {
      id: 'hp_yamuna_4',
      routeId: 'yamuna_exp',
      name: 'Khandauli Express Bay (Km 150)',
      shortName: 'Khandauli Bay #3',
      highwayKm: 150,
      lat: 27.3100,
      lng: 77.9000,
      type: 'Express Food Lay-by',
      laneInstruction: 'Left deceleration lane into Bay 3',
      safeSpeedThresholdKmph: 5,
      facilities: ['Quick Merge Lane', 'Rest Stop', 'Runner Kiosk'],
      runnerCapacity: 2
    },
    {
      id: 'hp_mp_1',
      routeId: 'mumbai_pune',
      name: 'Khalapur Safe Transit Lay-by (Km 34)',
      shortName: 'Khalapur Bay #1',
      highwayKm: 34,
      lat: 18.8100,
      lng: 73.2900,
      type: 'Toll Plaza Lay-by',
      laneInstruction: 'Extreme left lane post toll barrier',
      safeSpeedThresholdKmph: 5,
      facilities: ['Restrooms', 'Shaded Bay', 'Delivia Runner Hub'],
      runnerCapacity: 3
    },
    {
      id: 'hp_mp_2',
      routeId: 'mumbai_pune',
      name: 'Lonavala Express Food Bay (Km 56)',
      shortName: 'Lonavala Food Bay #2',
      highwayKm: 56,
      lat: 18.7520,
      lng: 73.4150,
      type: 'Food Mall Canopy',
      laneInstruction: 'Service lane adjacent to Food Mall',
      safeSpeedThresholdKmph: 5,
      facilities: ['Covered Drive-through Lay-by', 'CCTV', 'High-speed Merge'],
      runnerCapacity: 4
    },
    {
      id: 'hp_blr_1',
      routeId: 'blr_mysuru',
      name: 'Bidadi Safe Transit Hub (Km 30)',
      shortName: 'Bidadi Bay #1',
      highwayKm: 30,
      lat: 12.7920,
      lng: 77.3870,
      type: 'Smart Lay-by Bay',
      laneInstruction: 'Left service road entry to Bay 1',
      safeSpeedThresholdKmph: 5,
      facilities: ['CCTV', 'Solar Shading', 'Runner Kiosk'],
      runnerCapacity: 3
    },
    {
      id: 'hp_blr_2',
      routeId: 'blr_mysuru',
      name: 'Mandya Express Pull-Over (Km 84)',
      shortName: 'Mandya Bay #3',
      highwayKm: 84,
      lat: 12.5180,
      lng: 76.9000,
      type: 'Highway Lay-by Bay',
      laneInstruction: 'Left deceleration bay near Sugar Town exit',
      safeSpeedThresholdKmph: 5,
      facilities: ['CCTV', 'Highway Police Booth', 'Delivia Hub'],
      runnerCapacity: 3
    }
  ],

  restaurants: [
    {
      id: 'rest_shiva_dhaba',
      name: 'Shiva Tourist Dhaba & Family Restaurant',
      tagline: 'Authentic Tandoori & Highway Curries since 1994',
      routeId: 'yamuna_exp',
      associatedHandoffId: 'hp_yamuna_2',
      highwayKm: 68,
      lat: 27.9310,
      lng: 77.6740,
      cuisine: 'North Indian & Tandoori',
      rating: 4.8,
      ratingCount: 1420,
      avgPrepTimeMin: 14,
      isAiRecommended: true,
      badge: '👑 Best Sync Window Match',
      features: ['Packaging Stays Hot for 45m', 'Hygiene Verified 5-Star', 'Fast Kitchen'],
      image: '🍛',
      menu: [
        { id: 'm1', name: 'Special Paneer Butter Masala + 2 Tandoori Roti combo', price: 280, prepTimeMin: 12, veg: true, desc: 'Rich cottage cheese in creamy tomato gravy with charred whole wheat rotis', bestSeller: true },
        { id: 'm2', name: 'Highway Dal Makhani + Jeera Rice Bowl', price: 240, prepTimeMin: 10, veg: true, desc: 'Slow-cooked black lentils simmered overnight with butter and aromatic cumin rice', bestSeller: true },
        { id: 'm3', name: 'Crispy Butter Garlic Naan (2 pcs)', price: 110, prepTimeMin: 8, veg: true, desc: 'Clay-oven baked bread infused with minced roasted garlic and fresh herbs' },
        { id: 'm4', name: 'Chilled Punjabi Sweet Lassi in Earthen Matka', price: 90, prepTimeMin: 3, veg: true, desc: 'Thick curd churned with malai and cardamom (travel spill-proof sealed cup)' }
      ]
    },
    {
      id: 'rest_highway_king',
      name: 'Grand Highway King Multi-Cuisine Plaza',
      tagline: 'Quick Bowls, Rolls, Burgers & South Indian Breakfast',
      routeId: 'yamuna_exp',
      associatedHandoffId: 'hp_yamuna_1',
      highwayKm: 40,
      lat: 28.1480,
      lng: 77.5950,
      cuisine: 'Snacks, Rolls & Fast Casual',
      rating: 4.6,
      ratingCount: 980,
      avgPrepTimeMin: 9,
      isAiRecommended: true,
      badge: '⚡ Ultra-Fast Prep (8 min)',
      features: ['Spill-proof Packaging', 'Kids Meal Options', 'Express Prep'],
      image: '🌯',
      menu: [
        { id: 'm5', name: 'Highway Paneer Kathi Roll (Jumbo 2x)', price: 210, prepTimeMin: 7, veg: true, desc: 'Marinated cottage cheese, crunchy onions, and mint chutney wrapped in flaky paratha', bestSeller: true },
        { id: 'm6', name: 'Masala Dosa with Sambar & 2 Chutneys', price: 160, prepTimeMin: 9, veg: true, desc: 'Crispy fermented crepe filled with spiced potato masala with piping hot sambar' },
        { id: 'm7', name: 'Cold Brew Coffee with Hazelnut (500ml)', price: 175, prepTimeMin: 3, veg: true, desc: '18-hour steeped arabica coffee with Madagascar vanilla syrup' },
        { id: 'm8', name: 'Loaded Cheesy Farmhouse Sandwich', price: 180, prepTimeMin: 8, veg: true, desc: 'Toasted multi-grain bread with mozzarella, sweet corn, bell peppers, and jalapeños' }
      ]
    },
    {
      id: 'rest_mathura_pedha_hub',
      name: 'Brijwasi Sweets & Highway Cafe',
      tagline: 'World-Famous Mathura Peda, Kachori & Traditional Snacks',
      routeId: 'yamuna_exp',
      associatedHandoffId: 'hp_yamuna_3',
      highwayKm: 122,
      lat: 27.5200,
      lng: 77.7920,
      cuisine: 'Traditional Sweets & Street Food',
      rating: 4.9,
      ratingCount: 3100,
      avgPrepTimeMin: 6,
      isAiRecommended: false,
      badge: '✨ Mathura Heritage Special',
      features: ['Travel Gift Packs', 'Pure Desi Ghee', 'Ready in 5 min'],
      image: '🥮',
      menu: [
        { id: 'm9', name: 'Original Mathura Mewa Peda Box (500g)', price: 320, prepTimeMin: 2, veg: true, desc: 'Traditional caramelized milk fudge spiced with cardamom (vacuum sealed)', bestSeller: true },
        { id: 'm10', name: 'Crispy Bedmi Puri with Hing Aloo Sabzi (4 pcs)', price: 150, prepTimeMin: 6, veg: true, desc: 'Crisp urad dal stuffed puris served with spicy highway potato curry & tangy pickle', bestSeller: true },
        { id: 'm11', name: 'Gulab Jamun in Saffron Sugar Syrup (4 pcs)', price: 140, prepTimeMin: 3, veg: true, desc: 'Melt-in-mouth milk dumplings soaked in rose water syrup' }
      ]
    },
    {
      id: 'rest_khandauli_treats',
      name: 'Taj Express Food Court',
      tagline: 'Artisan Burgers, Pizza Slices, Momos & Refreshers',
      routeId: 'yamuna_exp',
      associatedHandoffId: 'hp_yamuna_4',
      highwayKm: 148,
      lat: 27.3150,
      lng: 77.8960,
      cuisine: 'Continental, Italian & Shakes',
      rating: 4.5,
      ratingCount: 740,
      avgPrepTimeMin: 11,
      isAiRecommended: false,
      badge: '🍕 Quick Gourmet Grab',
      features: ['Easy Car-friendly eating', 'Comes with travel wipes', 'Eco-friendly boxes'],
      image: '🍔',
      menu: [
        { id: 'm12', name: 'Gourmet Paneer Tikka Burger + Peri Peri Fries', price: 260, prepTimeMin: 10, veg: true, desc: 'Smoky grilled paneer steak with chipotle sauce in brioche bun + crispy fries', bestSeller: true },
        { id: 'm13', name: 'Classic Margherita Pizza Slice Box (2 Slices)', price: 220, prepTimeMin: 11, veg: true, desc: 'Stone-baked sourdough crust with San Marzano tomato sauce and fresh basil' },
        { id: 'm14', name: 'Thick Belgian Chocolate Shake (400ml)', price: 180, prepTimeMin: 4, veg: true, desc: 'Rich dark cocoa blended with cream and chocolate shavings' }
      ]
    },
    {
      id: 'rest_khalapur_oasis',
      name: 'Sunny Da Dhaba (Expressway Branch)',
      tagline: 'Legendary Highway Dhabba Food & Punjabi Flavours',
      routeId: 'mumbai_pune',
      associatedHandoffId: 'hp_mp_1',
      highwayKm: 33,
      lat: 18.8130,
      lng: 73.2870,
      cuisine: 'Punjabi & North Indian',
      rating: 4.7,
      ratingCount: 2200,
      avgPrepTimeMin: 13,
      isAiRecommended: true,
      badge: '👑 High Rated Dhaba',
      features: ['Freshly Prepared', 'Spill-proof containers', 'Highway Special'],
      image: '🍲',
      menu: [
        { id: 'm15', name: 'Butter Paneer Masala + 2 Laccha Paratha', price: 290, prepTimeMin: 12, veg: true, desc: 'Soft paneer in butter gravy paired with crispy flaky parathas', bestSeller: true },
        { id: 'm16', name: 'Rajma Chawal Highway Bowl', price: 210, prepTimeMin: 8, veg: true, desc: 'Punjabi style red kidney beans in thick spiced gravy with jeera rice' }
      ]
    },
    {
      id: 'rest_lonavala_chikki',
      name: 'Maganlal Lonavala Food Plaza',
      tagline: 'Famous Chikki, Fudge, Vada Pav & Masala Chai',
      routeId: 'mumbai_pune',
      associatedHandoffId: 'hp_mp_2',
      highwayKm: 55,
      lat: 18.7540,
      lng: 73.4120,
      cuisine: 'Maharashtrian Snacks & Confectionery',
      rating: 4.8,
      ratingCount: 3800,
      avgPrepTimeMin: 5,
      isAiRecommended: true,
      badge: '⚡ Quick 5-min Prep',
      features: ['Freshly Packed', 'Hot Highway Tea Kit', 'Famous Chikki'],
      image: '☕',
      menu: [
        { id: 'm17', name: 'Signature Mumbai Vada Pav (Pack of 2) + Masala Chai (2 cups)', price: 160, prepTimeMin: 5, veg: true, desc: 'Spiced potato fritters in soft pav with garlic chutney and piping ginger tea', bestSeller: true },
        { id: 'm18', name: 'Crushed Peanut Chikki + Chocolate Walnut Fudge Box', price: 260, prepTimeMin: 2, veg: true, desc: 'Fresh crunch chikki and decadent Lonavala soft fudge' }
      ]
    },
    {
      id: 'rest_bidadi_tatte_idli',
      name: 'Shree Renukamba Bidadi Tatte Idli',
      tagline: 'Authentic Steamy Tatte Idlis with Desi Butter',
      routeId: 'blr_mysuru',
      associatedHandoffId: 'hp_blr_1',
      highwayKm: 28,
      lat: 12.7950,
      lng: 77.3850,
      cuisine: 'Karnataka South Indian',
      rating: 4.9,
      ratingCount: 5200,
      avgPrepTimeMin: 6,
      isAiRecommended: true,
      badge: '⭐ Bidadi Heritage Specialty',
      features: ['Ultra Fast Prep', 'Piping Hot with Amul Butter', 'Travel-proof Box'],
      image: '🥟',
      menu: [
        { id: 'm19', name: 'Steaming Tatte Idli (2 pcs) with Fresh Butter & Coconut Chutney', price: 120, prepTimeMin: 5, veg: true, desc: 'Pillow-soft large plate idlis served with spicy potato saagu and fresh churned butter', bestSeller: true },
        { id: 'm20', name: 'Crispy Masala Vada (2 pcs) + Filter Coffee Thermos', price: 140, prepTimeMin: 5, veg: true, desc: 'Crunchy lentil fritters with pure chicory-blend South Indian filter coffee' }
      ]
    },
    {
      id: 'rest_mandya_highway',
      name: 'Kavery Highway Family Hub',
      tagline: 'Bisi Bele Bath, Biryani, Curd Rice & Fresh Sugarcane Juice',
      routeId: 'blr_mysuru',
      associatedHandoffId: 'hp_blr_2',
      highwayKm: 82,
      lat: 12.5200,
      lng: 76.8970,
      cuisine: 'South Indian & Meal Bowls',
      rating: 4.6,
      ratingCount: 1600,
      avgPrepTimeMin: 10,
      isAiRecommended: true,
      badge: '🍲 Comfort Highway Meal',
      features: ['Easy Spoons & Napkins', 'Digestive Buttermilk Included', 'High Hygiene'],
      image: '🍚',
      menu: [
        { id: 'm21', name: 'Special Karnataka Bisi Bele Bath with Boondi', price: 160, prepTimeMin: 8, veg: true, desc: 'Spiced hot lentil rice with vegetables topped with crispy boondi and pure ghee', bestSeller: true },
        { id: 'm22', name: 'Cold Pressed Sugarcane Juice with Ginger & Mint (500ml)', price: 80, prepTimeMin: 3, veg: true, desc: 'Fresh local Mandya sugarcane juice in insulated leak-proof bottle' }
      ]
    }
  ],

  runners: [
    {
      id: 'runner_1',
      name: 'Rohit Sharma (Runner #104)',
      phone: '+91 98765-43210',
      assignedHandoffId: 'hp_yamuna_2',
      status: 'AVAILABLE', // AVAILABLE, ASSIGNED, AT_LAYBY, COMPLETED
      rating: 4.95,
      totalHandOffs: 412,
      avgHandOffTimeSeconds: 45,
      currentLat: 27.9280,
      currentLng: 77.6750,
      avatar: '🏃'
    },
    {
      id: 'runner_2',
      name: 'Vikas Kumar (Runner #108)',
      phone: '+91 98112-76543',
      assignedHandoffId: 'hp_yamuna_1',
      status: 'AVAILABLE',
      rating: 4.88,
      totalHandOffs: 289,
      avgHandOffTimeSeconds: 52,
      currentLat: 28.1430,
      currentLng: 77.5980,
      avatar: '🏃'
    },
    {
      id: 'runner_3',
      name: 'Pooja Verma (Runner #112)',
      phone: '+91 97234-56789',
      assignedHandoffId: 'hp_yamuna_3',
      status: 'AVAILABLE',
      rating: 4.92,
      totalHandOffs: 350,
      avgHandOffTimeSeconds: 40,
      currentLat: 27.5190,
      currentLng: 77.7940,
      avatar: '🏃'
    },
    {
      id: 'runner_4',
      name: 'Mahesh Patil (Runner #201)',
      phone: '+91 98200-11223',
      assignedHandoffId: 'hp_mp_1',
      status: 'AVAILABLE',
      rating: 4.91,
      totalHandOffs: 520,
      avgHandOffTimeSeconds: 48,
      currentLat: 18.8120,
      currentLng: 73.2880,
      avatar: '🏃'
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DELIVIA_DATA;
}

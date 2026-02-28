import { Tour } from '../types';

const tours: Tour[] = [
  {
    id: '1',
    city: 'Paris',
    country: 'France',
    description:
      'Discover the City of Light on foot, from the iconic Eiffel Tower to the charming streets of Montmartre.',
    duration: 180,
    distance: 6.5,
    difficulty: 'moderate',
    color: '#2C3E8C',
    stops: [
      {
        id: '1-1',
        order: 1,
        name: 'Eiffel Tower',
        address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
        type: 'landmark',
        description:
          "The iconic iron lattice tower built by Gustave Eiffel for the 1889 World's Fair. At 330 metres tall, it was the world's tallest structure for over 40 years.",
        duration: 45,
        tips: 'Book tickets online to avoid long queues. The view from the second floor offers the best balance of height and detail.',
      },
      {
        id: '1-2',
        order: 2,
        name: "Musée d'Orsay",
        address: "1 Rue de la Légion d'Honneur, 75007 Paris",
        type: 'museum',
        description:
          "Housed in a former railway station, the Musée d'Orsay holds the world's largest collection of Impressionist and Post-Impressionist masterpieces, including works by Monet, Renoir, and Van Gogh.",
        duration: 60,
        tips: 'The museum is closed on Mondays. The café on the top floor has wonderful views of the Seine.',
      },
      {
        id: '1-3',
        order: 3,
        name: 'Notre-Dame Cathedral',
        address: 'Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris',
        type: 'landmark',
        description:
          'A masterpiece of French Gothic architecture dating from the 12th century. The cathedral is undergoing restoration following the 2019 fire.',
        duration: 30,
        tips: 'Even if entering is not possible, the exterior and the plaza are worth visiting. Look out for the famous gargoyles.',
      },
      {
        id: '1-4',
        order: 4,
        name: 'Le Marais',
        address: 'Le Marais, 75004 Paris',
        type: 'neighborhood',
        description:
          "One of Paris's most fashionable and historic neighborhoods, home to medieval architecture, art galleries, boutiques, and some of the city's best falafel.",
        duration: 30,
        tips: "Stroll through Place des Vosges, Paris's oldest planned square. Try a falafel from L'As du Fallafel on Rue des Rosiers.",
      },
      {
        id: '1-5',
        order: 5,
        name: 'Centre Pompidou',
        address: 'Place Georges-Pompidou, 75004 Paris',
        type: 'museum',
        description:
          "A radical example of high-tech architecture, the Pompidou Centre houses Europe's largest modern art museum. Its colorful pipes and exposed structure make it a landmark in its own right.",
        duration: 45,
        tips: 'The rooftop terrace offers sweeping views of Paris at no extra charge beyond the museum ticket.',
      },
    ],
  },
  {
    id: '2',
    city: 'Rome',
    country: 'Italy',
    description:
      'Walk through 2,500 years of history in the Eternal City, from ancient ruins to Baroque fountains.',
    duration: 240,
    distance: 7.2,
    difficulty: 'easy',
    color: '#C0392B',
    stops: [
      {
        id: '2-1',
        order: 1,
        name: 'Colosseum',
        address: 'Piazza del Colosseo, 1, 00184 Roma',
        type: 'landmark',
        description:
          "The world's largest amphitheatre, completed in 80 AD. It could hold up to 80,000 spectators who gathered to watch gladiatorial contests, animal hunts, and public spectacles.",
        duration: 60,
        tips: 'Book tickets in advance — the queues without a booking can take hours. The combined ticket includes the Roman Forum and Palatine Hill.',
      },
      {
        id: '2-2',
        order: 2,
        name: 'Roman Forum',
        address: 'Via Sacra, 00186 Roma',
        type: 'landmark',
        description:
          'The heart of ancient Rome, the Forum was a rectangular plaza surrounded by ruins of government buildings, temples, and markets. It was the centre of Roman public life for centuries.',
        duration: 45,
        tips: 'Walk to the top of Palatine Hill for a panoramic view of the entire Forum below.',
      },
      {
        id: '2-3',
        order: 3,
        name: 'Trevi Fountain',
        address: 'Piazza di Trevi, 00187 Roma',
        type: 'landmark',
        description:
          'The largest Baroque fountain in Rome and one of the most famous fountains in the world. The tradition of throwing a coin over your left shoulder with your right hand ensures a return to Rome.',
        duration: 20,
        tips: 'Visit early in the morning or late at night to avoid the largest crowds and get the best photos.',
      },
      {
        id: '2-4',
        order: 4,
        name: 'Pantheon',
        address: 'Piazza della Rotonda, 00186 Roma',
        type: 'landmark',
        description:
          'Built around 125 AD, the Pantheon is the best-preserved ancient Roman building. Its magnificent dome with the open oculus is a marvel of engineering that influenced architecture for centuries.',
        duration: 30,
        tips: 'Arrive early — the interior can get very crowded. Look up at the oculus: the only source of natural light in the building.',
      },
      {
        id: '2-5',
        order: 5,
        name: 'Piazza Navona',
        address: 'Piazza Navona, 00186 Roma',
        type: 'piazza',
        description:
          "A stunning Baroque piazza built on the site of a 1st-century stadium. It is home to three magnificent fountains, including Bernini's famous Fountain of the Four Rivers.",
        duration: 25,
        tips: 'The surrounding cafes are touristy, but sitting at the piazza with a gelato is an unmissable Roman experience.',
      },
      {
        id: '2-6',
        order: 6,
        name: 'Vatican Museums & Sistine Chapel',
        address: 'Viale Vaticano, 00165 Roma',
        type: 'museum',
        description:
          "One of the world's greatest art collections, culminating in Michelangelo's breathtaking Sistine Chapel ceiling. The museums contain galleries of Greek, Roman and Renaissance art.",
        duration: 120,
        tips: 'Book tickets well in advance. Photography is permitted in the museums but not in the Sistine Chapel.',
      },
    ],
  },
  {
    id: '3',
    city: 'Tokyo',
    country: 'Japan',
    description:
      "Explore the electric contrasts of ancient temples, neon-lit alleys, and serene gardens in Japan's capital.",
    duration: 210,
    distance: 8.0,
    difficulty: 'easy',
    color: '#1ABC9C',
    stops: [
      {
        id: '3-1',
        order: 1,
        name: 'Senso-ji Temple',
        address: '2-3-1 Asakusa, Taito City, Tokyo',
        type: 'temple',
        description:
          "Tokyo's oldest and most significant Buddhist temple, founded in 645 AD. The iconic Kaminarimon (Thunder Gate) with its massive red lantern is one of Japan's most photographed sights.",
        duration: 45,
        tips: 'Visit at sunrise for a serene experience before the crowds arrive. Draw an omikuji (fortune slip) for a traditional experience.',
      },
      {
        id: '3-2',
        order: 2,
        name: 'Akihabara Electric Town',
        address: 'Akihabara, Chiyoda City, Tokyo',
        type: 'neighborhood',
        description:
          "The world's capital of anime, manga, and electronics. Multi-storey buildings crammed with gadgets, figurines, arcade machines, and maid cafes make this one of Tokyo's most unique districts.",
        duration: 45,
        tips: "Explore the side streets as well as the main boulevard — many of the best shops are on upper floors of buildings you'd easily walk past.",
      },
      {
        id: '3-3',
        order: 3,
        name: 'Ueno Park & Museums',
        address: 'Uenokoen, Taito City, Tokyo',
        type: 'park',
        description:
          "Japan's first public park, home to multiple world-class museums, a zoo, Ueno Tosho-gu shrine, and the famous Shinobazu Pond. Renowned for cherry blossom season.",
        duration: 60,
        tips: 'The Tokyo National Museum is the largest art museum in Japan. During hanami (cherry blossom) season in late March, the park is spectacular.',
      },
      {
        id: '3-4',
        order: 4,
        name: 'Shibuya Crossing',
        address: 'Shibuya, Tokyo',
        type: 'landmark',
        description:
          "The world's busiest pedestrian crossing, where hundreds of people cross simultaneously from all directions. The surrounding neon signs, screens, and shops are quintessential modern Tokyo.",
        duration: 20,
        tips: "Watch from above at the Starbucks on the corner or from the Shibuya Sky observation deck for the best bird's-eye view of the famous crossing.",
      },
      {
        id: '3-5',
        order: 5,
        name: 'Meiji Jingu Shrine',
        address: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo',
        type: 'shrine',
        description:
          "A Shinto shrine dedicated to Emperor Meiji and Empress Shoken, set in a forested 70-hectare park in the heart of the city. Tokyo's most visited shrine.",
        duration: 40,
        tips: 'Walk the long forested path to the main shrine — the transition from the busy city to calm forest is remarkable.',
      },
    ],
  },
  {
    id: '4',
    city: 'New York',
    country: 'USA',
    description:
      "Experience the energy of the Big Apple with a walk through Manhattan's most iconic neighborhoods and landmarks.",
    duration: 195,
    distance: 5.8,
    difficulty: 'easy',
    color: '#8E44AD',
    stops: [
      {
        id: '4-1',
        order: 1,
        name: 'Central Park',
        address: 'Central Park, New York, NY 10024',
        type: 'park',
        description:
          'An 843-acre urban oasis in the heart of Manhattan. Designed by Frederick Law Olmsted and Calvert Vaux, Central Park contains meadows, lakes, forests, and iconic landmarks like Bethesda Fountain and Strawberry Fields.',
        duration: 60,
        tips: 'Rent a Citi Bike to cover more ground. Visit the Conservatory Garden in the northeast corner for a peaceful, less-visited gem.',
      },
      {
        id: '4-2',
        order: 2,
        name: 'The Metropolitan Museum of Art',
        address: '1000 5th Ave, New York, NY 10028',
        type: 'museum',
        description:
          "One of the world's largest and most comprehensive art museums, the Met houses over two million works spanning 5,000 years of human history from every corner of the globe.",
        duration: 90,
        tips: 'The Egyptian Temple of Dendur and the rooftop sculpture garden are crowd favourites.',
      },
      {
        id: '4-3',
        order: 3,
        name: 'Times Square',
        address: 'Times Square, New York, NY 10036',
        type: 'landmark',
        description:
          "The commercial and entertainment hub of Manhattan, Times Square is famous for its towering LED billboards, Broadway theatres, and its role as the site of the New Year's Eve ball drop.",
        duration: 30,
        tips: 'Visit at night for the full neon spectacle. Browse the TKTS booth for same-day discounted Broadway tickets.',
      },
      {
        id: '4-4',
        order: 4,
        name: 'The High Line',
        address: 'New York, NY 10011',
        type: 'park',
        description:
          'An elevated linear park built on a former New York Central Railroad spur. The 1.45-mile greenway offers unique views of the city, contemporary art installations, and beautiful plantings.',
        duration: 45,
        tips: 'Enter at 14th Street and walk north or south. The park is free and open daily. Chelsea Market at the base is great for food.',
      },
      {
        id: '4-5',
        order: 5,
        name: 'Brooklyn Bridge',
        address: 'Brooklyn Bridge, New York, NY 10038',
        type: 'landmark',
        description:
          'Completed in 1883, the Brooklyn Bridge was the longest suspension bridge in the world at the time. The pedestrian walkway offers stunning views of Lower Manhattan, the East River, and the Manhattan Bridge.',
        duration: 30,
        tips: 'Walk from Manhattan to Brooklyn for the best views of the skyline. Start early in the morning or at sunset for spectacular light and fewer cyclists.',
      },
    ],
  },
  {
    id: '5',
    city: 'Barcelona',
    country: 'Spain',
    description:
      "Stroll through Gaudí's architectural wonders, sun-drenched boulevards, and the vibrant Gothic Quarter.",
    duration: 210,
    distance: 7.0,
    difficulty: 'moderate',
    color: '#E67E22',
    stops: [
      {
        id: '5-1',
        order: 1,
        name: 'Sagrada Família',
        address: 'Carrer de Mallorca, 401, 08013 Barcelona',
        type: 'landmark',
        description:
          "Antoni Gaudí's unfinished masterpiece and the most visited monument in Spain. The basilica has been under construction since 1882 and blends Gothic and Art Nouveau styles in an extraordinary way.",
        duration: 60,
        tips: 'Book tickets online months in advance. Visit in the morning when sunlight streams through the stained glass windows on the eastern facade.',
      },
      {
        id: '5-2',
        order: 2,
        name: 'Park Güell',
        address: "Carrer d'Olot, s/n, 08024 Barcelona",
        type: 'park',
        description:
          'A public park designed by Antoni Gaudí, featuring colourful mosaic terraces, gingerbread gatehouses, a forest of tilted stone columns, and sweeping views over the city and the Mediterranean.',
        duration: 60,
        tips: "The Monumental Zone requires a timed ticket — book online. The park's outer areas are free to explore.",
      },
      {
        id: '5-3',
        order: 3,
        name: 'Gothic Quarter (Barri Gòtic)',
        address: 'Barri Gòtic, 08002 Barcelona',
        type: 'neighborhood',
        description:
          'The historic centre of Barcelona with a labyrinth of medieval streets built over Roman ruins. Home to the Barcelona Cathedral, Plaça Reial, and countless tapas bars and artisan shops.',
        duration: 45,
        tips: "Look down: Roman walls are incorporated into medieval buildings throughout. Seek out the Temple d'August for Roman columns inside a Gothic courtyard.",
      },
      {
        id: '5-4',
        order: 4,
        name: 'La Boqueria Market',
        address: 'La Rambla, 91, 08001 Barcelona',
        type: 'market',
        description:
          "Barcelona's most famous public market, overflowing with fresh produce, jamón, seafood, and fresh juice stalls. A sensory feast and a vital part of Catalan culinary culture.",
        duration: 30,
        tips: 'Head to the back of the market for better prices and more authentic produce stalls. Arrive before noon as many vendors close in the afternoon.',
      },
      {
        id: '5-5',
        order: 5,
        name: 'Barceloneta Beach',
        address: 'Barceloneta, 08003 Barcelona',
        type: 'beach',
        description:
          "Barcelona's most famous city beach, sitting just minutes from the Gothic Quarter. The wide sandy shore stretches along the Mediterranean coast, lined with chiringuitos (beach bars) and restaurants.",
        duration: 45,
        tips: 'Walk along the Passeig Marítim promenade. Late afternoon is ideal. Try fideuà (noodle paella) at one of the seafront restaurants.',
      },
    ],
  },
];

export default tours;

export const maps = [
  {
    id: 'dust2',
    name: 'Dust 2',
    image: '/maps/dust2.webp',
    backgroundImage: '/MapsIcon/Dust.jpg',
    icon: '/MapsIcon/DustIcon.webp',
    spots: [
      {
        id: 'd2-a-site',
        name: 'A Site',
        position: { x:68, y: 16 },
        nades: [
          {
            id: 'd2-a-ct-smoke',
            type: 'smoke',
            team: 'T',
            title: 'CT A smoke',
            description: 'Stand near the blue container, aim at the line-up between the houses, throw',
            trajectory: [
              { x: 765, y: 490 },  // Start position
              { x: 820, y: 245 }   // End position
            ],
            difficulty: 'Easy',
            tickrate: '64/128',
            technique: 'Standing throw',
            videoUrl: 'https://www.youtube.com/embed/7Q8N_y92GbQ'
          },
          {
            id: 'd2-a-box-smoke',
            type: 'smoke',
            team: 'CT',
            title: 'Box Smoke',
            description: 'Stand in the corner under the platform, aim for the top of the roof, jump throw',
            trajectory: [
              { x: 790, y: 195 },  // Start position
              { x: 710, y: 560 }   // End position
            ],
            difficulty: 'Easy',
            tickrate: '64/128',
            technique: 'Jump throw',
            videoUrl: 'https://www.youtube.com/embed/-ae_l5nKVpg'
          },
          {
            id: 'd2-mid-door-smoke',
            type: 'smoke',
            team: 'T',
            title: 'Test Long Smoke',
            description: 'Mid door smoke',
            difficulty: 'Easy',
            tickrate: '64/128',
            technique: 'Standing throw',
            videoUrl: 'https://www.youtube.com/embed/WBDdtrhMDMQ',
            trajectory: [
              { x:465, y: 885 },  // Start position
              { x: 470, y: 370 }   // End position
            ],
            name: 'Test Long Smoke'
          },
          {
            id: 'd2-long-flash',
            type: 'flash',
            team: 'CT',
            title: 'Long flash',
            description: 'Flash for pick long',
            difficulty: 'Easy',
            tickrate: '64/128',
            technique: 'Standing throw',
            videoUrl: 'https://www.youtube.com/embed/1aHpihQ6BC4&ab',
            trajectory: [
              { x: 850, y: 275 },  // Start position
              { x: 865, y: 470 }   // End position
            ],
            name: 'Test Long Smoke'
          }
        ]
      },
      {
        id: 'd2-b-site',
        name: 'B Site',
        position: { x: 32, y: 13 },
        nades: [
          {
            id: 'd2-b-window-smoke',
            type: 'smoke',
            team: 'T',
            title: 'Window Smoke',
            description: 'Stand in the corner and aim at the dot like in the video, jump throw',
            trajectory: [
              { x: 265, y: 620 },  // Start position
              { x: 265, y: 130 }   // End position
            ],
            difficulty: 'Easy',
            tickrate: '64/128',
            technique: 'Jump throw',
            videoUrl: 'https://www.youtube.com/embed/rKXpN-gq22Q'
          },
          {
           id: 'd2-b-window-smoke',
            type: 'smoke',
            team: 'T',
            title: 'Door Smoke',
            description: 'Stand in the corner and aim at the dot like in the video, jump throw',
            trajectory: [
              { x: 265, y: 620 },  // Start position
              { x: 265, y: 220 }   // End position
            ],
            difficulty: 'Easy',
            tickrate: '64/128',
            technique: 'Jump throw',
            videoUrl: 'https://www.youtube.com/embed/rKXpN-gq22Q'
          }
        ]
      }
    ]
  },
  {
    id: 'mirage',
    name: 'Mirage',
    image: '/maps/mirage.webp',
    backgroundImage: '/MapsIcon/mirage.webp',
    icon: '/MapsIcon/MirageIcon.webp',
    spots: [
      {
        id: 'mirage-a-site',
        name: 'A Site',
        position: { x: 70, y: 30 },
        nades: [
          {
            id: 'mirage-mid-smoke',
            type: 'smoke',
            team: 'T',
            title: 'Mid Smoke',
            description: 'Stand at T base dump, aim at the window corner, jump throw + D',
            trajectory: [
              { x: 935, y: 325 },  // Start position
              { x: 410, y: 465 }   // End position
            ],
            difficulty: 'Medium',
            tickrate: '64/128',
            technique: 'Jump throw + D',
            videoUrl: 'https://www.youtube.com/embed/WGFYA8RexbA'
          },
          {
            id: 'mirage-stairs-smoke',
            type: 'smoke',
            team: 'T',
            title: 'Stairs Smoke',
            description: 'Stand at T ramp, aim at the same angle, jump throw',
            trajectory: [
              { x: 810, y: 645 },  // Start position
              { x: 550, y: 660 }   // End position
            ],
            difficulty: 'Medium',
            tickrate: '64/128',
            technique: 'Jump throw',
            videoUrl: 'https://www.youtube.com/embed/lKBl4yj7mKk'
          },
          {
            id: 'mirage-under-stairs-smoke',
            type: 'smoke',
            team: 'T',
            title: 'Under stairs Smoke',
            description: 'Stand at T ramp, aim at the same angle, jump throw',
            trajectory: [
              { x: 810, y: 645 },  // Start position
              { x: 510, y: 660 }   // End position
            ],
            difficulty: 'Medium',
            tickrate: '64/128',
            technique: 'Jump throw',
            videoUrl: 'https://www.youtube.com/embed/lKBl4yj7mKk'
          },
          {
            id: 'mirage-connector-molotov',
            type: 'molotov',
            team: 'T',
            title: 'Connector molotov',
            description: 'Stand at top mid angel, aim at the same angle, jump throw',
            trajectory: [
              { x: 675, y: 390 },  // Start position
              { x: 510, y: 520 }   // End position
            ],
            difficulty: 'Easy',
            tickrate: '64/128',
            technique: 'Jump throw',
            videoUrl: 'https://www.youtube.com/embed/KnZbfR5bLMI'
          }
        ]
      }
    ]
  },
  {
    id: 'nuke',
    name: 'Nuke',
    image: '/maps/nuke.webp',
    backgroundImage: '/MapsIcon/Nuke.webp',
    icon: '/MapsIcon/NukeIcon.webp',
    spots: []
  },
  {
    id: 'inferno',
    name: 'Inferno',
    image: '/maps/inferno.png',
    backgroundImage: '/MapsIcon/Inferno.jpeg',
    icon: '/MapsIcon/InfernoIcon.webp',
    spots: []
  },
  {
    id: 'overpass',
    name: 'Overpass',
    image: '/maps/overpass.webp',
    backgroundImage: '/MapsIcon/Overpass.webp',
    icon: '/MapsIcon/OverpassIcon.webp',
    spots: []
  },
  {
    id: 'anubis',
    name: 'Anubis',
    image: '/maps/anubis.png',
    backgroundImage: '/MapsIcon/Anubis.webp',
    icon: '/MapsIcon/AnubisIcon.webp',
    spots: []
  },
  {
    id: 'ancient',
    name: 'Ancient',
    image: '/maps/ancient.webp',
    backgroundImage: '/MapsIcon/Ancient.webp',
    icon: '/MapsIcon/AncientIcon.webp',
    spots: []
  }
];

export const nadeTypes = [
  { 
    id: 'smoke', 
    name: 'Smoke', 
    color: 'rgba(200, 200, 200, 0.8)',
    icons: {
      T: 'endGrenadeIcons/SmokeT.png',
      CT: 'endGrenadeIcons/SmokeCT.png'
    }
  },
  { 
    id: 'flash', 
    name: 'Flash', 
    color: 'rgba(255, 255, 200, 0.8)',
    icons: {
      T: 'endGrenadeIcons/flash.png',
      CT: 'endGrenadeIcons/flash.png'
    }
  },
  { 
    id: 'molotov', 
    name: 'Molotov', 
    color: 'rgba(255, 100, 100, 0.8)',
    icons: {
      T: 'endGrenadeIcons/molotov.png',
      CT: 'endGrenadeIcons/molotov.png'
    }
  },
  { 
    id: 'he', 
    name: 'HE Grenade', 
    color: 'rgba(100, 255, 100, 0.8)',
    icons: {
      T: 'endGrenadeIcons/he.png',
      CT: 'endGrenadeIcons/he.png'
    }
  }
];

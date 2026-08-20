import type { Product, Category, Client, Certification } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Adhesives',
    description: 'High-performance structural epoxy, cyanoacrylate, and contact adhesives for aerospace and industrial bonding applications.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054883/apr_services/categories/adhesives.jpg',
    order: 1,
  },
  {
    id: 'cat-2',
    name: 'Coatings',
    description: 'Corrosion-resistant primers, military polyurethane topcoats, and specialty aerospace protective finishes.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054885/apr_services/categories/coatings.jpg',
    order: 2,
  },
  {
    id: 'cat-3',
    name: 'Film Adhesives',
    description: 'Structural film adhesives and composite bonding films engineered for extreme aerospace environments.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054906/apr_services/categories/film_adhesives.jpg',
    order: 3,
  },
  {
    id: 'cat-4',
    name: 'Mechanical Items',
    description: 'Precision aircraft hardware, single wire braid hoses, AN/MS rivets, O-rings, and structural fasteners.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054887/apr_services/categories/mechanical_items.jpg',
    order: 4,
  },
  {
    id: 'cat-5',
    name: 'Cleaners',
    description: 'Aviation degreasers, solvent cleaners, paint strippers, and aircraft washing compounds safe for structural alloys.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054889/apr_services/categories/cleaners.jpg',
    order: 5,
  },
  {
    id: 'cat-6',
    name: 'Lubricants',
    description: 'High-temperature lubricants, dry-film lubricants, anti-seize compounds, and precision assembly fluids.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054891/apr_services/categories/lubricants.jpg',
    order: 6,
  },
  {
    id: 'cat-7',
    name: 'Mechanical Consumables',
    description: 'Silicon carbide abrasive sheets, Scotch-Brite pads, Rymplecloth wipes, and surface conditioning tools.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054894/apr_services/categories/mechanical_consumables.jpg',
    order: 7,
  },
  {
    id: 'cat-8',
    name: 'Tapes',
    description: 'Polyurethane erosion protection tapes, anodization masking tapes, high-temp flame retardant tapes, and VHB acrylics.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054896/apr_services/categories/tapes.jpg',
    order: 8,
  },
  {
    id: 'cat-9',
    name: 'NDT Chemicals',
    description: 'Fluorescent penetrants, developers, magnetic particle inks, and non-destructive inspection consumables.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054898/apr_services/categories/ndt_chemicals.jpg',
    order: 9,
  },
  {
    id: 'cat-10',
    name: 'Oils',
    description: 'Synthetic aviation turbine oils, fire-resistant phosphate ester hydraulic fluids, and piston engine lubricants.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054899/apr_services/categories/oils.jpg',
    order: 10,
  },
  {
    id: 'cat-11',
    name: 'Paints',
    description: 'Aerospace polyurethane topcoats, epoxy primers, touch-up finishes, and military specification coatings.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054901/apr_services/categories/paints.jpg',
    order: 11,
  },
  {
    id: 'cat-12',
    name: 'Greases',
    description: 'Synthetic aviation greases, extreme pressure wheel bearing greases, and silicone O-ring compounds.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054903/apr_services/categories/greases.jpg',
    order: 12,
  },
  {
    id: 'cat-13',
    name: 'Sealants',
    description: 'Polysulfide aircraft fuel tank sealants, high-temperature silicone RTVs, and environmental gasketing compounds.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054905/apr_services/categories/sealants.jpg',
    order: 13,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // ── Adhesives ─────────────────────────────────
  {
    id: 'prod-adh-1',
    name: '3M Scotch-Weld Epoxy Adhesive EC 2216 B/A Gray',
    category: 'Adhesives',
    description: 'Flexible two-part epoxy adhesive that cures at room temperature. Provides high shear and peel strength while remaining exceptionally resistant to vibration, thermal cycling, and harsh aviation fluids.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054924/apr_services/products/3m_ec_2216.png',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod-adh-2',
    name: '3M 86A Adhesion Promoter Transparent',
    category: 'Adhesives',
    description: 'Liquid adhesion promoter specifically formulated for enhancing bond strength of tapes, polyurethane films, and sealants to aerospace composites and primed aluminum.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054925/apr_services/products/3m_86a.png',
    createdAt: '2026-01-16',
  },
  {
    id: 'prod-adh-3',
    name: 'Loctite EA 9497 High Temp Epoxy Adhesive',
    category: 'Adhesives',
    description: 'Thermally conductive, high temperature resistant two-component epoxy adhesive. Ideal for bonding heat-generating electronic components, aerospace sensors, and mechanical structures.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054883/apr_services/categories/adhesives.jpg',
    createdAt: '2026-01-17',
  },
  {
    id: 'prod-adh-4',
    name: '3M EC 1357 Gray Green Contact Adhesive',
    category: 'Adhesives',
    description: 'High-performance neoprene contact adhesive. Rapid bond formation with immediate handling strength for bonding metal honeycomb skins, wood, rubber, and decorative laminates.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054927/apr_services/products/3m_ec1357.png',
    createdAt: '2026-01-18',
  },
  {
    id: 'prod-adh-5',
    name: 'Loctite 635 High Strength Retaining Compound',
    category: 'Adhesives',
    description: 'High viscosity, slow curing anaerobic retaining compound designed for cylindrical fitting parts with large clearance gaps. Prevents fretting corrosion and loosening under severe vibration.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054934/apr_services/products/loctite_635.png',
    createdAt: '2026-01-19',
  },
  {
    id: 'prod-adh-6',
    name: 'Instabond 124 Threadlocker Medium Strength',
    category: 'Adhesives',
    description: 'Anaerobic threadlocking compound for securing threaded fasteners against shock and vibration. Disassembles with standard hand tools.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054928/apr_services/products/instabond_124.png',
    createdAt: '2026-01-20',
  },
  {
    id: 'prod-adh-7',
    name: 'KS35 A/B Epoxy Knifing Stopper Paste',
    category: 'Adhesives',
    description: 'Two-component thixotropic epoxy paste for surface filling, hole potting, and smoothing aircraft honeycomb structures and fairings.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054929/apr_services/products/ks35_ab.png',
    createdAt: '2026-01-21',
  },
  {
    id: 'prod-adh-8',
    name: 'Metal Set A4 Aluminum Filled Epoxy Resin',
    category: 'Adhesives',
    description: 'Smooth metallic epoxy putty for repairing aluminum castings, machining flaws, aircraft cowl skins, and non-structural metal defects.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054930/apr_services/products/metal_set_a4.png',
    createdAt: '2026-01-22',
  },
  {
    id: 'prod-adh-9',
    name: 'A56-BR-1 De-Icer Conductive Cement',
    category: 'Adhesives',
    description: 'Specialized conductive bonding cement designed for attaching pneumatic de-icer boots to aircraft wing and empennage leading edges.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054932/apr_services/products/a56_br1.png',
    createdAt: '2026-01-23',
  },
  {
    id: 'prod-adh-10',
    name: 'Devcon 2 Ton Clear Epoxy Adhesive',
    category: 'Adhesives',
    description: 'Extremely strong, water-resistant clear epoxy paste. 2,500 psi tensile strength for metal, glass, acrylic transparencies, and hard plastics.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054933/apr_services/products/devcon_2ton.jpg',
    createdAt: '2026-01-24',
  },

  // ── Coatings ──────────────────────────────────
  {
    id: 'prod-coat-1',
    name: 'Deft Military Polyurethane Camouflage Topcoat',
    category: 'Coatings',
    description: 'Chemical agent resistant coating (CARC) and aerospace polyurethane topcoat. Formulated for extreme weatherability, UV resistance, hydraulic fluid tolerance, and low infrared reflectivity.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054885/apr_services/categories/coatings.jpg',
    createdAt: '2026-01-25',
  },
  {
    id: 'prod-coat-2',
    name: 'Bonderite M-CR 1201 Aero (Alodine 1201)',
    category: 'Coatings',
    description: 'Chromate conversion chemical coating for aluminum alloys. Produces a protective gold-colored film that dramatically improves corrosion resistance and provides superior paint adhesion.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054885/apr_services/categories/coatings.jpg',
    createdAt: '2026-01-26',
  },

  // ── Film Adhesives ────────────────────────────
  {
    id: 'prod-film-1',
    name: '3M AF 163-2K Structural Adhesive Film',
    category: 'Film Adhesives',
    description: 'Modified epoxy structural adhesive film reinforced with knit carrier. Provides exceptional toughness, high peel strength, and high service temperature performance for composite bonding.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054906/apr_services/categories/film_adhesives.jpg',
    createdAt: '2026-01-27',
  },

  // ── Mechanical Items ──────────────────────────
  {
    id: 'prod-mech-1',
    name: 'Aeroquip Medium Pressure Aviation Hose',
    category: 'Mechanical Items',
    description: 'Flexible seamless synthetic rubber hose with single wire braid reinforcement. Qualified for aircraft hydraulic, fuel, lubrication, and coolant lines with operational reliability.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054887/apr_services/categories/mechanical_items.jpg',
    createdAt: '2026-01-28',
  },
  {
    id: 'prod-mech-2',
    name: 'MS20426AD Precision Countersunk Aircraft Rivets',
    category: 'Mechanical Items',
    description: 'Solid aluminum alloy rivets with 100-degree countersunk heads for aerodynamic surface skin attachment. Manufactured to strict military specification MS20426 standards.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054887/apr_services/categories/mechanical_items.jpg',
    createdAt: '2026-01-29',
  },

  // ── Cleaners ──────────────────────────────────
  {
    id: 'prod-clean-1',
    name: 'Callington Aero Wash Aircraft Exterior Cleaner',
    category: 'Cleaners',
    description: 'Heavy-duty, biodegradable exterior aircraft cleaning concentrate. Conforms to Boeing D6-17487 and AMS 1526 specifications, safe on acrylic transparencies, composite panels, and polyurethane paints.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054889/apr_services/categories/cleaners.jpg',
    createdAt: '2026-01-30',
  },

  // ── Lubricants ────────────────────────────────
  {
    id: 'prod-lub-1',
    name: 'Boelube 70201 Solid Squeeze Tube Lubricant',
    category: 'Lubricants',
    description: 'High-performance advanced metalworking lubricant for aircraft machining, drilling, and reaming. Significantly extends tool life and delivers superior hole finish in titanium and aluminum.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054891/apr_services/categories/lubricants.jpg',
    createdAt: '2026-01-31',
  },

  // ── Mechanical Consumables ────────────────────
  {
    id: 'prod-cons-1',
    name: '301 Rymplecloth Aviation Grade Cotton Wipes',
    category: 'Mechanical Consumables',
    description: '100% purified continuous-filament woven cotton wiping fabric meeting AMS 3819 and BMS 15-5F. Completely free from silicone, lint, and contaminants for critical surface preparation.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054894/apr_services/categories/mechanical_consumables.jpg',
    createdAt: '2026-02-01',
  },

  // ── Tapes ─────────────────────────────────────
  {
    id: 'prod-tape-1',
    name: '3M Polyurethane Protective Tape 8671HS',
    category: 'Tapes',
    description: 'High-durability erosion protection polyurethane tape with pressure-sensitive acrylic adhesive. Protects aircraft leading edges, radomes, and helicopter rotor blades from rain and sand erosion.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054896/apr_services/categories/tapes.jpg',
    createdAt: '2026-02-02',
  },

  // ── NDT Chemicals ─────────────────────────────
  {
    id: 'prod-ndt-1',
    name: 'Ardrox 970P25 High Sensitivity Fluorescent Penetrant',
    category: 'NDT Chemicals',
    description: 'Level 2 water-washable and post-emulsifiable fluorescent penetrant for detecting micro-cracks and discontinuities in turbine engine components, structural castings, and forgings.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054898/apr_services/categories/ndt_chemicals.jpg',
    createdAt: '2026-02-03',
  },

  // ── Oils ──────────────────────────────────────
  {
    id: 'prod-oil-1',
    name: 'Mobil Jet Oil II Gas Turbine Lubricant',
    category: 'Oils',
    description: 'Standard synthetic turbine engine oil formulating a combination of highly stable synthetic base fluid with unique additive package. Outstanding thermal and oxidation stability up to 400°F.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054899/apr_services/categories/oils.jpg',
    createdAt: '2026-02-04',
  },

  // ── Paints ────────────────────────────────────
  {
    id: 'prod-pnt-1',
    name: 'TT-P-1757B Zinc Chromate Aircraft Primer Green',
    category: 'Paints',
    description: 'Single-package, fast-drying alkyd base zinc chromate primer meeting TT-P-1757B Type I Class C. Delivers exceptional corrosion protection on aluminum and ferrous metals.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054901/apr_services/categories/paints.jpg',
    createdAt: '2026-02-05',
  },

  // ── Greases ───────────────────────────────────
  {
    id: 'prod-grs-1',
    name: 'AeroShell Grease 33 Multipurpose Airframe Grease',
    category: 'Greases',
    description: 'Synthetic ester/polyalphaolefin grease with lithium complex thickener. Qualified to BMS 3-33B and MIL-PRF-23827C Type I, offering superior corrosion resistance and wide operating temperature.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054903/apr_services/categories/greases.jpg',
    createdAt: '2026-02-06',
  },

  // ── Sealants ──────────────────────────────────
  {
    id: 'prod-seal-1',
    name: 'PR-1422 B-2 Aircraft Fuel Tank Sealant',
    category: 'Sealants',
    description: 'Two-part manganese dioxide cured polysulfide compound for sealing integral aircraft fuel tanks and fuselages. Maintains elastomeric seal when exposed to aviation jet fuels and temperature extremes.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054905/apr_services/categories/sealants.jpg',
    createdAt: '2026-02-07',
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'partner-1',
    name: '3M Aerospace',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054908/apr_services/partners/3m_aerospace.png',
    order: 1,
    isActive: true,
  },
  {
    id: 'partner-2',
    name: 'Henkel Aerospace / Loctite',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054910/apr_services/partners/henkel_aerospace.jpg',
    order: 2,
    isActive: true,
  },
  {
    id: 'partner-3',
    name: 'Huntsman Advanced Materials',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054912/apr_services/partners/huntsman.jpg',
    order: 3,
    isActive: true,
  },
  {
    id: 'partner-4',
    name: 'Callington Aviation',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054913/apr_services/partners/callington.jpg',
    order: 4,
    isActive: true,
  },
  {
    id: 'partner-5',
    name: 'Chemetall / Ardrox',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054915/apr_services/partners/chemetall_ardrox.jpg',
    order: 5,
    isActive: true,
  },
  {
    id: 'partner-6',
    name: 'PPG Aerospace',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054917/apr_services/partners/ppg_aerospace.jpg',
    order: 6,
    isActive: true,
  },
  {
    id: 'partner-7',
    name: 'AeroShell Aviation Lubricants',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054919/apr_services/partners/aeroshell.jpg',
    order: 7,
    isActive: true,
  },
  {
    id: 'partner-8',
    name: 'Eastman Skydrol',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054921/apr_services/partners/eastman_skydrol.png',
    order: 8,
    isActive: true,
  },
  {
    id: 'partner-9',
    name: 'Airbus Helicopters Group',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054922/apr_services/partners/airbus_helicopters.svg',
    order: 9,
    isActive: true,
  },
];

export const INITIAL_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-1',
    title: 'ISO 9001:2015 Quality Management System',
    issuer: 'Bureau Veritas Certification',
    year: '2023 - 2026',
    imageUrl: '',
  },
  {
    id: 'cert-2',
    title: 'ISO 14001:2015 Environmental Management',
    issuer: 'DNV GL Business Assurance',
    year: '2023 - 2026',
    imageUrl: '',
  },
  {
    id: 'cert-3',
    title: 'Government e-Marketplace (GeM) Certified',
    issuer: 'Ministry of Commerce and Industry',
    year: 'Active OEM Vendor',
    imageUrl: '',
  },
  {
    id: 'cert-4',
    title: 'MSME & Udyam Registered Enterprise',
    issuer: 'Government of India',
    year: 'UDYAM-DL-08-001245',
    imageUrl: '',
  },
];

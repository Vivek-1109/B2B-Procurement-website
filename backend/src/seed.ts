import 'dotenv/config';
import connectDB from './config/db';
import { getPool } from './config/db';
import { createAdmin } from './models/Admin';


const categories = [
  {
    name: 'Adhesives',
    description: 'High-performance structural epoxy, cyanoacrylate, and contact adhesives for aerospace and industrial bonding applications.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054883/apr_services/categories/adhesives.jpg',
    order: 1,
  },
  {
    name: 'Coatings',
    description: 'Corrosion-resistant primers, military polyurethane topcoats, and specialty aerospace protective finishes.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054885/apr_services/categories/coatings.jpg',
    order: 2,
  },
  {
    name: 'Film Adhesives',
    description: 'Structural film adhesives and composite bonding films engineered for extreme aerospace environments.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054906/apr_services/categories/film_adhesives.jpg',
    order: 3,
  },
  {
    name: 'Mechanical Items',
    description: 'Precision aircraft hardware, single wire braid hoses, AN/MS rivets, O-rings, and structural fasteners.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054887/apr_services/categories/mechanical_items.jpg',
    order: 4,
  },
  {
    name: 'Cleaners',
    description: 'Aviation degreasers, solvent cleaners, paint strippers, and aircraft washing compounds safe for structural alloys.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054889/apr_services/categories/cleaners.jpg',
    order: 5,
  },
  {
    name: 'Lubricants',
    description: 'High-temperature lubricants, dry-film lubricants, anti-seize compounds, and precision assembly fluids.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054891/apr_services/categories/lubricants.jpg',
    order: 6,
  },
  {
    name: 'Mechanical Consumables',
    description: 'Silicon carbide abrasive sheets, Scotch-Brite pads, Rymplecloth wipes, and surface conditioning tools.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054894/apr_services/categories/mechanical_consumables.jpg',
    order: 7,
  },
  {
    name: 'Tapes',
    description: 'Polyurethane erosion protection tapes, anodization masking tapes, high-temp flame retardant tapes, and VHB acrylics.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054896/apr_services/categories/tapes.jpg',
    order: 8,
  },
  {
    name: 'NDT Chemicals',
    description: 'Fluorescent penetrants, developers, magnetic particle inks, and non-destructive inspection consumables.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054898/apr_services/categories/ndt_chemicals.jpg',
    order: 9,
  },
  {
    name: 'Oils',
    description: 'Synthetic aviation turbine oils, fire-resistant phosphate ester hydraulic fluids, and piston engine lubricants.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054899/apr_services/categories/oils.jpg',
    order: 10,
  },
  {
    name: 'Paints',
    description: 'Aerospace polyurethane topcoats, epoxy primers, touch-up finishes, and military specification coatings.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054901/apr_services/categories/paints.jpg',
    order: 11,
  },
  {
    name: 'Greases',
    description: 'Synthetic aviation greases, extreme pressure wheel bearing greases, and silicone O-ring compounds.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054903/apr_services/categories/greases.jpg',
    order: 12,
  },
  {
    name: 'Sealants',
    description: 'Polysulfide aircraft fuel tank sealants, high-temperature silicone RTVs, and environmental gasketing compounds.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054905/apr_services/categories/sealants.jpg',
    order: 13,
  },
];

const products = [
  {
    name: '3M Scotch-Weld Epoxy Adhesive EC 2216 B/A Gray',
    category: 'Adhesives',
    description: 'Flexible two-part epoxy adhesive that cures at room temperature. Provides high shear and peel strength while remaining exceptionally resistant to vibration, thermal cycling, and harsh aviation fluids.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054924/apr_services/products/3m_ec_2216.png',
    isActive: true,
  },
  {
    name: '3M 86A Adhesion Promoter Transparent',
    category: 'Adhesives',
    description: 'Liquid adhesion promoter specifically formulated for enhancing bond strength of tapes, polyurethane films, and sealants to aerospace composites and primed aluminum.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054925/apr_services/products/3m_86a.png',
    isActive: true,
  },
  {
    name: 'Loctite EA 9497 High Temp Epoxy Adhesive',
    category: 'Adhesives',
    description: 'Thermally conductive, high temperature resistant two-component epoxy adhesive. Ideal for bonding heat-generating electronic components, aerospace sensors, and mechanical structures.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054883/apr_services/categories/adhesives.jpg',
    isActive: true,
  },
  {
    name: '3M EC 1357 Gray Green Contact Adhesive',
    category: 'Adhesives',
    description: 'High-performance neoprene contact adhesive. Rapid bond formation with immediate handling strength for bonding metal honeycomb skins, wood, rubber, and decorative laminates.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054927/apr_services/products/3m_ec1357.png',
    isActive: true,
  },
  {
    name: 'Loctite 635 High Strength Retaining Compound',
    category: 'Adhesives',
    description: 'High viscosity, slow curing anaerobic retaining compound designed for cylindrical fitting parts with large clearance gaps. Prevents fretting corrosion and loosening under severe vibration.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054934/apr_services/products/loctite_635.png',
    isActive: true,
  },
  {
    name: 'Instabond 124 Threadlocker Medium Strength',
    category: 'Adhesives',
    description: 'Anaerobic threadlocking compound for securing threaded fasteners against shock and vibration. Disassembles with standard hand tools.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054928/apr_services/products/instabond_124.png',
    isActive: true,
  },
  {
    name: 'KS35 A/B Epoxy Knifing Stopper Paste',
    category: 'Adhesives',
    description: 'Two-component thixotropic epoxy paste for surface filling, hole potting, and smoothing aircraft honeycomb structures and fairings.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054929/apr_services/products/ks35_ab.png',
    isActive: true,
  },
  {
    name: 'Metal Set A4 Aluminum Filled Epoxy Resin',
    category: 'Adhesives',
    description: 'Smooth metallic epoxy putty for repairing aluminum castings, machining flaws, aircraft cowl skins, and non-structural metal defects.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054930/apr_services/products/metal_set_a4.png',
    isActive: true,
  },
  {
    name: 'A56-BR-1 De-Icer Conductive Cement',
    category: 'Adhesives',
    description: 'Specialized conductive bonding cement designed for attaching pneumatic de-icer boots to aircraft wing and empennage leading edges.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054932/apr_services/products/a56_br1.png',
    isActive: true,
  },
  {
    name: 'Devcon 2 Ton Clear Epoxy Adhesive',
    category: 'Adhesives',
    description: 'Extremely strong, water-resistant clear epoxy paste. 2,500 psi tensile strength for metal, glass, acrylic transparencies, and hard plastics.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054933/apr_services/products/devcon_2ton.jpg',
    isActive: true,
  },
  {
    name: 'Deft Military Polyurethane Camouflage Topcoat',
    category: 'Coatings',
    description: 'Chemical agent resistant coating (CARC) and aerospace polyurethane topcoat. Formulated for extreme weatherability, UV resistance, hydraulic fluid tolerance, and low infrared reflectivity.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054885/apr_services/categories/coatings.jpg',
    isActive: true,
  },
  {
    name: 'Bonderite M-CR 1201 Aero (Alodine 1201)',
    category: 'Coatings',
    description: 'Chromate conversion chemical coating for aluminum alloys. Produces a protective gold-colored film that dramatically improves corrosion resistance and provides superior paint adhesion.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054885/apr_services/categories/coatings.jpg',
    isActive: true,
  },
  {
    name: '3M AF 163-2K Structural Adhesive Film',
    category: 'Film Adhesives',
    description: 'Modified epoxy structural adhesive film reinforced with knit carrier. Provides exceptional toughness, high peel strength, and high service temperature performance for composite bonding.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054906/apr_services/categories/film_adhesives.jpg',
    isActive: true,
  },
  {
    name: 'Aeroquip Medium Pressure Aviation Hose',
    category: 'Mechanical Items',
    description: 'Flexible seamless synthetic rubber hose with single wire braid reinforcement. Qualified for aircraft hydraulic, fuel, lubrication, and coolant lines with operational reliability.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054887/apr_services/categories/mechanical_items.jpg',
    isActive: true,
  },
  {
    name: 'MS20426AD Precision Countersunk Aircraft Rivets',
    category: 'Mechanical Items',
    description: 'Solid aluminum alloy rivets with 100-degree countersunk heads for aerodynamic surface skin attachment. Manufactured to strict military specification MS20426 standards.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054887/apr_services/categories/mechanical_items.jpg',
    isActive: true,
  },
  {
    name: 'Callington Aero Wash Aircraft Exterior Cleaner',
    category: 'Cleaners',
    description: 'Heavy-duty, biodegradable exterior aircraft cleaning concentrate. Conforms to Boeing D6-17487 and AMS 1526 specifications, safe on acrylic transparencies, composite panels, and polyurethane paints.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054889/apr_services/categories/cleaners.jpg',
    isActive: true,
  },
  {
    name: 'Boelube 70201 Solid Squeeze Tube Lubricant',
    category: 'Lubricants',
    description: 'High-performance advanced metalworking lubricant for aircraft machining, drilling, and reaming. Significantly extends tool life and delivers superior hole finish in titanium and aluminum.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054891/apr_services/categories/lubricants.jpg',
    isActive: true,
  },
  {
    name: '301 Rymplecloth Aviation Grade Cotton Wipes',
    category: 'Mechanical Consumables',
    description: '100% purified continuous-filament woven cotton wiping fabric meeting AMS 3819 and BMS 15-5F. Completely free from silicone, lint, and contaminants for critical surface preparation.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054894/apr_services/categories/mechanical_consumables.jpg',
    isActive: true,
  },
  {
    name: '3M Polyurethane Protective Tape 8671HS',
    category: 'Tapes',
    description: 'High-durability erosion protection polyurethane tape with pressure-sensitive acrylic adhesive. Protects aircraft leading edges, radomes, and helicopter rotor blades from rain and sand erosion.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054896/apr_services/categories/tapes.jpg',
    isActive: true,
  },
  {
    name: 'Ardrox 970P25 High Sensitivity Fluorescent Penetrant',
    category: 'NDT Chemicals',
    description: 'Level 2 water-washable and post-emulsifiable fluorescent penetrant for detecting micro-cracks and discontinuities in turbine engine components, structural castings, and forgings.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054898/apr_services/categories/ndt_chemicals.jpg',
    isActive: true,
  },
  {
    name: 'Mobil Jet Oil II Gas Turbine Lubricant',
    category: 'Oils',
    description: 'Standard synthetic turbine engine oil formulating a combination of highly stable synthetic base fluid with unique additive package. Outstanding thermal and oxidation stability up to 400°F.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054899/apr_services/categories/oils.jpg',
    isActive: true,
  },
  {
    name: 'TT-P-1757B Zinc Chromate Aircraft Primer Green',
    category: 'Paints',
    description: 'Single-package, fast-drying alkyd base zinc chromate primer meeting TT-P-1757B Type I Class C. Delivers exceptional corrosion protection on aluminum and ferrous metals.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054901/apr_services/categories/paints.jpg',
    isActive: true,
  },
  {
    name: 'AeroShell Grease 33 Multipurpose Airframe Grease',
    category: 'Greases',
    description: 'Synthetic ester/polyalphaolefin grease with lithium complex thickener. Qualified to BMS 3-33B and MIL-PRF-23827C Type I, offering superior corrosion resistance and wide operating temperature.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054903/apr_services/categories/greases.jpg',
    isActive: true,
  },
  {
    name: 'PR-1422 B-2 Aircraft Fuel Tank Sealant',
    category: 'Sealants',
    description: 'Two-part manganese dioxide cured polysulfide compound for sealing integral aircraft fuel tanks and fuselages. Maintains elastomeric seal when exposed to aviation jet fuels and temperature extremes.',
    imageUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054905/apr_services/categories/sealants.jpg',
    isActive: true,
  },
];

const clients = [
  {
    name: '3M Aerospace',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054908/apr_services/partners/3m_aerospace.png',
    order: 1,
    isActive: true,
  },
  {
    name: 'Henkel Aerospace / Loctite',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054910/apr_services/partners/henkel_aerospace.jpg',
    order: 2,
    isActive: true,
  },
  {
    name: 'Huntsman Advanced Materials',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054912/apr_services/partners/huntsman.jpg',
    order: 3,
    isActive: true,
  },
  {
    name: 'Callington Aviation',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054913/apr_services/partners/callington.jpg',
    order: 4,
    isActive: true,
  },
  {
    name: 'Chemetall / Ardrox',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054915/apr_services/partners/chemetall_ardrox.jpg',
    order: 5,
    isActive: true,
  },
  {
    name: 'PPG Aerospace',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054917/apr_services/partners/ppg_aerospace.jpg',
    order: 6,
    isActive: true,
  },
  {
    name: 'AeroShell Aviation Lubricants',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054919/apr_services/partners/aeroshell.jpg',
    order: 7,
    isActive: true,
  },
  {
    name: 'Eastman Skydrol',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054921/apr_services/partners/eastman_skydrol.png',
    order: 8,
    isActive: true,
  },
  {
    name: 'Airbus Helicopters Group',
    logoUrl: 'https://res.cloudinary.com/dbw4bmkoo/image/upload/v1787054923/apr_services/partners/airbus_helicopters.svg',
    order: 9,
    isActive: true,
  },
];

const certifications = [
  {
    title: 'ISO 9001:2015 Quality Management System',
    imageUrl: '',
    issuer: 'Bureau Veritas Certification',
    year: '2023 - 2026',
    order: 1,
  },
  {
    title: 'ISO 14001:2015 Environmental Management',
    imageUrl: '',
    issuer: 'DNV GL Business Assurance',
    year: '2023 - 2026',
    order: 2,
  },
  {
    title: 'Government e-Marketplace (GeM) Certified',
    imageUrl: '',
    issuer: 'Ministry of Commerce and Industry',
    year: 'Active OEM Vendor',
    order: 3,
  },
  {
    title: 'MSME & Udyam Registered Enterprise',
    imageUrl: '',
    issuer: 'Government of India',
    year: 'UDYAM-DL-08-001245',
    order: 4,
  },
];

const seed = async (): Promise<void> => {
  console.log('🌱 Syncing Cloudinary assets with PostgreSQL (Neon)...');
  await connectDB();

  const pool = getPool();

  // ── Admin ───────────────────────────────────────────────────
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@prosource.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';

  const { rows: existingAdmins } = await pool.query(
    'SELECT id FROM admins WHERE email = $1 LIMIT 1',
    [adminEmail.toLowerCase().trim()]
  );

  if (existingAdmins.length === 0) {
    await createAdmin({ email: adminEmail, plainPassword: adminPassword, role: 'super_admin' });
    console.log(`✅ Created admin: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }

  // ── Products ────────────────────────────────────────────────
  await pool.query('DELETE FROM products');
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, category, description, image_url, cloudinary_public_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [(p as any).name, (p as any).category, (p as any).description, (p as any).imageUrl || '', (p as any).cloudinaryPublicId || '']
    );
  }
  console.log(`✅ Seeded ${products.length} products with Cloudinary URLs`);

  // ── Categories ──────────────────────────────────────────────
  await pool.query('DELETE FROM categories');
  for (const c of categories) {
    await pool.query(
      `INSERT INTO categories (name, description, image_url, cloudinary_public_id, "order")
       VALUES ($1, $2, $3, $4, $5)`,
      [(c as any).name, (c as any).description, (c as any).imageUrl || '', (c as any).cloudinaryPublicId || '', (c as any).order ?? 0]
    );
  }
  console.log(`✅ Seeded ${categories.length} categories with Cloudinary URLs`);

  // ── Certifications ──────────────────────────────────────────
  await pool.query('DELETE FROM certifications');
  for (const cert of certifications) {
    await pool.query(
      `INSERT INTO certifications (title, image_url, issuer, year, "order")
       VALUES ($1, $2, $3, $4, $5)`,
      [cert.title, cert.imageUrl || '', cert.issuer || '', cert.year || '', cert.order ?? 0]
    );
  }
  console.log(`✅ Seeded ${certifications.length} certifications`);

  // ── Clients ─────────────────────────────────────────────────
  await pool.query('DELETE FROM clients');
  for (const cl of clients) {
    await pool.query(
      `INSERT INTO clients (name, logo_url, cloudinary_public_id, "order")
       VALUES ($1, $2, $3, $4)`,
      [(cl as any).name, (cl as any).logoUrl || '', (cl as any).cloudinaryPublicId || '', (cl as any).order ?? 0]
    );
  }
  console.log(`✅ Seeded ${clients.length} partners with Cloudinary logos`);

  await pool.end();
  console.log('✅ Database sync complete.');
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});


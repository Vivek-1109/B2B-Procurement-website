import 'dotenv/config';
import cloudinary from './config/cloudinary';

const CATEGORY_IMAGES = [
  { name: 'Adhesives', url: 'https://divyanshiaviation.com/assets/img/products/Adhesives.jpg', publicId: 'categories/adhesives' },
  { name: 'Coatings', url: 'https://divyanshiaviation.com/assets/img/products/Coating.jpg', publicId: 'categories/coatings' },
  { name: 'Mechanical Items', url: 'https://divyanshiaviation.com/assets/img/products/Mechancial%20Items.jpg', publicId: 'categories/mechanical_items' },
  { name: 'Cleaners', url: 'https://divyanshiaviation.com/assets/img/products/Cleaners.jpg', publicId: 'categories/cleaners' },
  { name: 'Lubricants', url: 'https://divyanshiaviation.com/assets/img/products/Lubricants.jpg', publicId: 'categories/lubricants' },
  { name: 'Mechanical Consumables', url: 'https://divyanshiaviation.com/assets/img/products/Mechancial%20Consumables.jpg', publicId: 'categories/mechanical_consumables' },
  { name: 'Tapes', url: 'https://divyanshiaviation.com/assets/img/products/Tapes.jpg', publicId: 'categories/tapes' },
  { name: 'NDT Chemicals', url: 'https://divyanshiaviation.com/assets/img/products/NDT%20Chemicals.jpg', publicId: 'categories/ndt_chemicals' },
  { name: 'Oils', url: 'https://divyanshiaviation.com/assets/img/products/Oils.jpg', publicId: 'categories/oils' },
  { name: 'Paints', url: 'https://divyanshiaviation.com/assets/img/products/Paints.jpg', publicId: 'categories/paints' },
  { name: 'Greases', url: 'https://divyanshiaviation.com/assets/img/products/Grease.jpg', publicId: 'categories/greases' },
  { name: 'Sealants', url: 'https://divyanshiaviation.com/assets/img/products/Sealants.jpg', publicId: 'categories/sealants' },
  { name: 'Film Adhesives', url: 'https://divyanshiaviation.com/assets/img/products/Adhesives.jpg', publicId: 'categories/film_adhesives' },
];

const PARTNER_LOGOS = [
  { name: '3M Aerospace', url: 'https://divyanshiaviation.com/assets/img/clients/c1.png', publicId: 'partners/3m_aerospace' },
  { name: 'Henkel Aerospace / Loctite', url: 'https://divyanshiaviation.com/assets/img/clients/c3.jpg', publicId: 'partners/henkel_aerospace' },
  { name: 'Huntsman Advanced Materials', url: 'https://divyanshiaviation.com/assets/img/clients/c4.jpg', publicId: 'partners/huntsman' },
  { name: 'Callington Aviation', url: 'https://divyanshiaviation.com/assets/img/clients/c5.jpg', publicId: 'partners/callington' },
  { name: 'Chemetall / Ardrox', url: 'https://divyanshiaviation.com/assets/img/clients/c6.jpg', publicId: 'partners/chemetall_ardrox' },
  { name: 'PPG Aerospace', url: 'https://divyanshiaviation.com/assets/img/clients/c7.jpg', publicId: 'partners/ppg_aerospace' },
  { name: 'AeroShell Aviation Lubricants', url: 'https://divyanshiaviation.com/assets/img/clients/c8.jpg', publicId: 'partners/aeroshell' },
  { name: 'Eastman Skydrol', url: 'https://divyanshiaviation.com/assets/img/clients/c9.png', publicId: 'partners/eastman_skydrol' },
  { name: 'Airbus Helicopters Group', url: 'https://divyanshiaviation.com/assets/img/clients/AHG_Symbol_193x133.svg', publicId: 'partners/airbus_helicopters' },
];

const PRODUCT_IMAGES = [
  { name: '3M EC 2216 B/A Gray', url: 'https://divyanshiaviationservices.com/files/stock_images/3M2216GRY-43ML/3m.png', publicId: 'products/3m_ec_2216' },
  { name: '3M 86A Promoter', url: 'https://divyanshiaviationservices.com/files/stock_images/3M86A-PT/3M-8985L-Anodization-Masking-Tape.png', publicId: 'products/3m_86a' },
  { name: '3M DP 460 Off-White', url: 'https://divyanshiaviationservices.com/files/stock_images_new/3MDP460OFFWHT-50ML/Image_20260212_1524584633496495362204780.jpeg', publicId: 'products/3m_dp460' },
  { name: '3M EC 3549 B/A', url: 'https://divyanshiaviationservices.com/files/stock_images_new/3MEC3549-4OZKIT/Image_20260330_1425222528713219821168601.jpeg', publicId: 'products/3m_ec3549' },
  { name: '3M EC 1357 Gray Green', url: 'https://divyanshiaviationservices.com/files/stock_images/EC1357GRYGRN-1GLN/Screenshot%202025-01-02%20112428.png', publicId: 'products/3m_ec1357' },
  { name: 'Instabond 124', url: 'https://divyanshiaviationservices.com/files/stock_images/INSTABOND124-50ML/Screenshot%202025-01-10%20100939.png', publicId: 'products/instabond_124' },
  { name: 'KS35 A/B Epocast', url: 'https://divyanshiaviationservices.com/files/stock_images/KS35A/B-1.5KGKT/Screenshot%202025-01-13%20105410.png', publicId: 'products/ks35_ab' },
  { name: 'Metal Set A4', url: 'https://divyanshiaviationservices.com/files/stock_images/A4-METALSET-6OZ/s.PNG', publicId: 'products/metal_set_a4' },
  { name: 'A56-BR-1 Conductive', url: 'https://divyanshiaviationservices.com/files/stock_images/A56B-QRT/sky.PNG', publicId: 'products/a56_br1' },
  { name: 'Devcon 2 Ton Epoxy', url: 'https://divyanshiaviationservices.com/files/stock_images/DEV2T0N-25ML/devcon.jpg', publicId: 'products/devcon_2ton' },
  { name: 'Loctite 635 Retaining', url: 'https://divyanshiaviationservices.com/files/stock_images/LT635-50ML/Screenshot%202025-01-14%20163621.png', publicId: 'products/loctite_635' },
];

async function uploadAll() {
  console.log('🚀 Starting Cloudinary asset upload...');
  const uploadedResults: Record<string, string> = {};

  // Upload Categories
  console.log('\n📁 Uploading category images...');
  for (const cat of CATEGORY_IMAGES) {
    try {
      const res = await cloudinary.uploader.upload(cat.url, {
        folder: 'apr_services/categories',
        public_id: cat.publicId.replace('categories/', ''),
        overwrite: true,
      });
      uploadedResults[cat.name] = res.secure_url;
      console.log(`✅ Category [${cat.name}] -> ${res.secure_url}`);
    } catch (err: any) {
      console.warn(`⚠️ Failed to upload category ${cat.name}:`, err.message || err);
    }
  }

  // Upload Partner Logos
  console.log('\n🤝 Uploading partner logos...');
  for (const partner of PARTNER_LOGOS) {
    try {
      const res = await cloudinary.uploader.upload(partner.url, {
        folder: 'apr_services/partners',
        public_id: partner.publicId.replace('partners/', ''),
        overwrite: true,
      });
      uploadedResults[partner.name] = res.secure_url;
      console.log(`✅ Partner [${partner.name}] -> ${res.secure_url}`);
    } catch (err: any) {
      console.warn(`⚠️ Failed to upload partner ${partner.name}:`, err.message || err);
    }
  }

  // Upload Product Images
  console.log('\n📦 Uploading product images...');
  for (const prod of PRODUCT_IMAGES) {
    try {
      const res = await cloudinary.uploader.upload(prod.url, {
        folder: 'apr_services/products',
        public_id: prod.publicId.replace('products/', ''),
        overwrite: true,
      });
      uploadedResults[prod.name] = res.secure_url;
      console.log(`✅ Product [${prod.name}] -> ${res.secure_url}`);
    } catch (err: any) {
      console.warn(`⚠️ Failed to upload product ${prod.name}:`, err.message || err);
    }
  }

  console.log('\n🎉 Cloudinary Upload Completed! Result Summary:');
  console.log(JSON.stringify(uploadedResults, null, 2));
}

uploadAll();

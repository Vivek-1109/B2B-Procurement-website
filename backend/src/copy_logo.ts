import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import cloudinary from './config/cloudinary';

const src = 'C:\\Users\\vjha1\\.gemini\\antigravity\\brain\\4bc154d3-a43d-4463-a200-501a9adec306\\apr_services_logo_1787055528239.jpg';
const dest = path.resolve(__dirname, '../../public/apr-logo.jpg');

async function run() {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied logo to ${dest}`);

    const res = await cloudinary.uploader.upload(src, {
      folder: 'apr_services/brand',
      public_id: 'apr_services_logo',
      overwrite: true,
    });
    console.log(`✅ Uploaded logo to Cloudinary: ${res.secure_url}`);
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

run();

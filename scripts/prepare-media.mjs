// Copies the curated photos from the Wix scrape into /public/media with clean names,
// applying EXIF rotation and capping the long edge so the repo stays light.
// Usage: node scripts/prepare-media.mjs ../scrape/assets
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(process.argv[2] ?? "../scrape/assets");
const OUT = path.resolve("public/media");
const img = (f) => path.join(SRC, "images", f);

const MAP = {
  // Field & team
  "photos/crew-yard.jpg": "DSC00022_edited__0b1bae_c147c96ce9024e8a9ddc45b845b035f0~mv2.jpg",
  "photos/thread-closeup.jpg": "IMG_20241030_154210_edited__0b1bae_12b90198d8c449e796a658d37bcb4280~mv2.jpg",
  "photos/team-uniform.jpg": "personalnov_edited__0b1bae_452b48a8ad53428ca5ef452c576043f0~mv2.jpg",
  "photos/team-blue.jpg": "DSC00110__0b1bae_73b4755a30814f518b1eecf4f2554c5a~mv2.jpg",
  "photos/inspector-logo.jpg": "IMG_20241030_153122_1_edited__0b1bae_f187869529b3450c984a7e63ff037916~mv2.jpg",
  "photos/bit-inspection.jpg": "IMAG0136__0b1bae_73a8525baef44116b0cf87e93715b60d~mv2_d_5376_3024_s_4_2.jpg",
  "photos/tool-measure.jpg": "6c86552c-69bd-4162-bba7-d11bad0522ed__0b1bae_dc5225fe168b457f92e164f46b0249c5~mv2.jpg",
  "photos/workshop-team.jpg": "20180126_100538_Film1__0b1bae_7821741d1a534d46bafc5387f33b07fa~mv2_d_4160_3120_s_4_2.jpg",
  "photos/warehouse.jpg": "WhatsApp-Image-2018-12-14-at-7.43.51-PM__0b1bae_0607322109a24c518ba509254ee236b4~mv2.jpeg",
  "photos/pressure-wash.jpg": "WhatsApp-Image-2018-12-20-at-3.50.04-PM__0b1bae_56979bb2ff264840942e5ea2b886ffda~mv2.jpeg",
  "photos/ut-equipment.jpg": "Max-MVX1__0b1bae_824e77dde1f6409ba2a04c8731cc5205~mv2.jpg",
  "photos/oil-field.jpg": "perforacionpetrolera1__0b1bae_9c47cb3fdd254242ba0f1fc06eeb7ae3~mv2.jpg",
  "photos/pipe-bore.jpg": "WhatsApp-Image-2018-12-20-at-3.50.14-PM__0b1bae_0e95c0b3189c487b83f53b53d502da35~mv2.jpeg",
  "photos/pipe-bore-2.jpg": "WhatsApp-Image-2018-12-20-at-3.51.03-PM__0b1bae_3d90f33186b446029f22a2c6c4f04f53~mv2.jpeg",
  "photos/drill-bit.jpg": "0b1bae_caee3cc13c7744bb8d6420ab829abe46~mv2.jpeg",
  "photos/pdc-bit.jpg": "0b1bae_3445d7898ff348d3bc1cdcb0edc5d2fc~mv2.jpeg",
  "photos/team-office.jpg": "WhatsApp-Image-2018-11-19-at-1.20_edited__0b1bae_51ac034670a24c06b0a3c2579a1f28ab~mv2.jpg",
  "photos/uv-inspector.jpg": "WhatsApp-Image-2018-08-16-at-7.49.22-PM__0b1bae_a7ff77dcfd9048cbb6b5b9ed5d43ab4e~mv2.jpeg",
  "photos/engineering-tools.jpg": "Engineering-Tools_edited__0b1bae_51bcb89387d7411c9093ce4cca08ce06~mv2.jpg",
  "photos/abstract-arch.jpg": "pexels-matheus-natan-3297593-_1_-_2___a3c153_56669e38ce904a728a6246879d546efe~mv2.jpg",
  // Magnetic particles (MT)
  "methods/mt-1.jpg": "0b1bae_43c6b61a68ef45f6b05c42faf54304be~mv2.jpeg",
  "methods/mt-2.jpg": "0b1bae_18f71e00b9cf4707aa1fe5508b37c83d~mv2.jpeg",
  "methods/mt-3.jpg": "0b1bae_701fc082a9944842b78d2ef604503648~mv2.jpeg",
  "methods/mt-4.jpg": "0b1bae_e03aa0c7c96244809d22e3293e610649~mv2.jpeg",
  "methods/mt-5.jpg": "magnaflux__0b1bae_9927977e6425461c92bad96e848ad229~mv2.jpg",
  "methods/mt-6.jpg": "WhatsApp-Image-2018-12-20-at-3.50.03-PM__0b1bae_1a55105ec38b4e79b29fe5dc2b73a80c~mv2.jpeg",
  "methods/mt-7.jpg": "0b1bae_0ec04b9266c04c7682cfd029f6f89a6f~mv2.jpeg",
  "methods/mt-8.jpg": "IMAG3373__0b1bae_a806e4b70eff4e32a70398e66dd47ed1~mv2_d_5376_3024_s_4_2.jpg",
  "methods/mt-yoke.jpg": "0b1bae_ba84423c88804b1eb4d053305af6c89e~mv2.jpeg",
  "methods/mt-9.jpg": "0b1bae_6eb8f63e42384ca094272012f7fd57cf~mv2.jpeg",
  "methods/mt-10.jpg": "0b1bae_907d195cf0e7495cb1ba2149fb932bee~mv2.jpeg",
  "methods/mt-11.jpg": "0b1bae_ebf7c99534634ef087beaf12f54d146d~mv2.jpeg",
  "methods/mt-12.jpg": "WhatsApp-Image-2018-12-20-at-3.50.11-PM__0b1bae_d74660f10f374f84b77b48b2bed3a3ed~mv2.jpeg",
  "methods/mt-13.jpg": "WhatsApp-Image-2018-12-20-at-3.51__0b1bae_650acb0eb73e43fc968bb5adc97be7f8~mv2.jpeg",
  "methods/mt-14.jpg": "WhatsApp-Image-2018-12-20-at-3.54.48-PM__0b1bae_d6905d5658e445fc8cafbe9b11ee751b~mv2.jpeg",
  "methods/mt-15.jpg": "0b1bae_92680a4b7d9448c0be0feb418a56cf39~mv2.jpeg",
  "methods/mt-16.jpg": "WhatsApp-Image-2018-11-04-at-1.21.47-PM__0b1bae_c99a8c7d3ead4f8e8b67df56c51eb871~mv2.jpeg",
  // Penetrant liquids (PT)
  "methods/pt-1.jpg": "0b1bae_5a6ef19dfafa4d3aa695b272e5ccd716f002.jpg",
  "methods/pt-2.jpg": "LIQIDOS-P__0b1bae_f4d0f6c7e3a94ad884b677022d1a0502~mv2.jpg",
  "methods/pt-3.jpg": "0b1bae_e8d5897de9434952a949f361fe751994~mv2.jpeg",
  "methods/pt-4.jpg": "0b1bae_f972dc0808724061957b61c4f90ecbf3~mv2.jpeg",
  "methods/pt-5.jpg": "0b1bae_00ca33189160422384b5682ac0a1be84~mv2.jpeg",
  "methods/pt-6.jpg": "WhatsApp-Image-2018-12-20-at-3.51__0b1bae_f70e884c4d714c9bb8d8044de0fbd980~mv2.jpeg",
  "methods/pt-7.jpg": "0b1bae_428b1530b05e4b9fb924073733dc59a5~mv2.jpeg",
  "methods/pt-8.jpg": "0b1bae_42c911823ff04fb5819168a1a77adfc5~mv2.jpeg",
  "methods/pt-9.jpg": "0b1bae_cc65d674f0f34066af596ab8a36d7e66~mv2.jpeg",
  "methods/pt-10.jpg": "0b1bae_83ff4a1965f047aa813d68b7203210b8~mv2.jpeg",
  "methods/pt-11.jpg": "0b1bae_a8cc25812a204dc5b52e970260cfb23c~mv2.jpeg",
  "methods/pt-12.jpg": "0b1bae_e37c44c58845419e8650f07882763194~mv2.jpeg",
  "methods/pt-13.jpg": "WhatsApp-Image-2018-12-20-at-3.51__0b1bae_b3a37d74de68461691f42e6a5616d302~mv2.jpeg",
  // Ultrasound (UT)
  "methods/ut-1.jpg": "0b1bae_a933dfaec6c74a278e22d65cf69d1be4~mv2.jpeg",
  "methods/ut-2.jpg": "WhatsApp-Image-2018-12-11-at-11.13__0b1bae_47c3cb1fdf944321a762b850e3312129~mv2.jpeg",
  "methods/ut-3.jpg": "0b1bae_26bc3a45f34a473898cbd8bcce13fae8~mv2_d_5376_3024_s_4_2.jpg",
  "methods/ut-4.jpg": "0b1bae_5384f428b04f4d4e86ad4e9d3c19e298~mv2_d_5376_3024_s_4_2.jpg",
  "methods/ut-5.jpg": "WhatsApp-Image-2018-12-11-at-11.13__0b1bae_dde0cb6c80bf42eaba640b37aa4eec71~mv2.jpeg",
  // Visual & dimensional (VT)
  "methods/vt-1.jpg": "0b1bae_150c58c71fa044e38c3b21a4b8982f05~mv2.jpeg",
  "methods/vt-2.jpg": "0b1bae_ca2121d0f1f04f38af97e08a5dcf2d00~mv2.jpeg",
  "methods/vt-3.jpg": "WhatsApp-Image-2018-08-15-at-4.44.46-PM__0b1bae_0f47e0313c9041c49e755d57fb12409a~mv2.jpeg",
  "methods/vt-4.jpg": "0b1bae_48e20022e00e42fdb45ffe341c3544bd~mv2.jpg",
  // HSEQ
  "hseq/training-1.jpg": "IMG_20241002_090121_edited__0b1bae_a81e05b729d5468bae3460a70eac83c7~mv2.jpg",
  "hseq/training-2.jpg": "IMG_20241002_090225_edited__0b1bae_76c71e046ffb424f86fdc273fe07a65e~mv2.jpg",
  "hseq/training-3.jpg": "IMG_20241002_091137_edited__0b1bae_8fdf9612a2634eb4b1a4b07f4711c66d~mv2.jpg",
  "hseq/integration-1.jpg": "WhatsApp-Image-2024-12-16-at-9.08.44-AM__0b1bae_eb36ed258a7145d29bd2760ffb31d4e3~mv2.jpeg",
  "hseq/integration-2.jpg": "WhatsApp-Image-2024-12-16-at-9.08.44-AM-_2___0b1bae_35ba7a3250d94d20a03455ec0f922985~mv2.jpeg",
  "hseq/planting-1.jpg": "German__a4c078_7892100d1ac84caaa4fba90d335da673~mv2.jpg",
  "hseq/planting-2.jpg": "Siembra__a4c078_153cbc83b0024a33943d354d2e838d9a~mv2.jpg",
  "hseq/planting-3.jpg": "Grupo-Tech__a4c078_b3137e2f52c74eab8ae7b716dafbf11d~mv2.jpg",
  "hseq/planting-4.jpg": "Siembra-2__a4c078_89c510fdb40643a39619c50ebe889b92~mv2.jpg",
  "hseq/wellbeing.jpg": "bienestar__a4c078_ce1c520a67294f638c56b51401d93c54~mv2.jpg",
  "hseq/integration-3.jpg": "IMG-20180602-WA0004__a4c078_febde9bf193945228fd1d6f8e52b8a97~mv2.jpg",
  "hseq/integration-4.jpg": "WhatsApp-Image-2024-12-16-at-2.34_edited__0b1bae_f02b89eed1c8418cb44c07b342439fc1~mv2.jpg",
  "hseq/planting-carlos.jpg": "Carlos__a4c078_3b90536035a3499eb9d2d721d86e84d7~mv2.jpg",
  "hseq/planting-juan.jpg": "Juan__a4c078_f746cf5f3c1f4e41922fb9f6f2c1c18e~mv2.jpg",
  "hseq/planting-julio.jpg": "Julio__a4c078_041ffaf0f41343148db9a80b51786af2~mv2.jpg",
  "hseq/planting-paola.jpg": "Paola__a4c078_6344d678c5f849a092e5d526acd9d28f~mv2.jpg",
  "hseq/ppe-strip.jpg": "Grupal__a4c078_e87af9e05d9446d0980bc878ca31c86f~mv2.png",
  "hseq/data-protection.jpg": "proteccion-datos__a4c078_8de5f2f6afc0436b9440fa74631f1be8~mv2.png",
  // Leadership
  "team/julio.jpg": "Julio-1__a4c078_691382590e4b455286733aabd6c6944a~mv2.jpg",
  "team/mariela.jpg": "Mariela-1__a4c078_41c2b3e648614eebbe83e60270c69940~mv2.jpg",
};

const LOGOS = {
  "clients/smartstar.png": "smart__a4c078_efb794bdf36d47539f37a06f5493cd33~mv2.jpg",
  "clients/petroexpress.png": "petroexpress-1__a4c078_0e97c862b3d347e99b749a4b56b82d5f~mv2.png",
  "clients/universal.png": "Universal__a4c078_cab14991a1b54b9e995018e6d452f909~mv2.png",
  "clients/amertuval.png": "Amertuval-2__a4c078_e933f2864ca04e0cb4badcbcc1865575~mv2.jpg",
  "clients/ctb.png": "Colombia-Tools__a4c078_e44a0b3ffb2741b29ce1a53199083ad1~mv2.png",
  "brand/logo.png": "logooficialsf__0b1bae_63172e836eff496baa3bb5cbdbe1559d~mv2.png",
};

const VIDEOS = {
  "video/mt-field.mp4": "0b1bae_502d5b1cfc14442fb1357be0a004381b_360p.mp4",
  "video/pt-field.mp4": "0b1bae_5a6ef19dfafa4d3aa695b272e5ccd716_360p.mp4",
};

// Images lifted from the client deck (presentacion cliente ulterra.pdf), cropped clear of slide text.
// Source PNGs live in ../scrape/deck; crop = [left, top, width, height] in source pixels.
const DECK_SRC = path.resolve(SRC, "../deck");
const DECK = {
  "deck/pdc-bit.jpg": { src: "p01-1-1672x941.png" },
  "deck/team.jpg": { src: "p03-0-1536x1024.png", crop: [0, 0, 1250, 560] },
  "deck/ut-inspector.jpg": { src: "p04-1-1536x1024.png", crop: [640, 0, 896, 720] },
  "deck/ut-scan.jpg": { src: "p04-4-688x506.png" },
  "deck/bit-report.jpg": { src: "p04-5-476x528.png" },
  "deck/pt-inspector.jpg": { src: "p07-0-1536x1024.png", crop: [0, 60, 410, 760] },
  "deck/partner-meeting.jpg": { src: "p09-7-1536x1024.png", crop: [0, 0, 1536, 500] },
  "deck/partner-field.jpg": { src: "p09-7-1536x1024.png", crop: [0, 626, 394, 188] },
  "deck/partner-training.jpg": { src: "p09-7-1536x1024.png", crop: [400, 626, 380, 188] },
  "deck/partner-review.jpg": { src: "p09-7-1536x1024.png", crop: [786, 626, 352, 188] },
  "deck/partner-caliper.jpg": { src: "p09-7-1536x1024.png", crop: [400, 822, 378, 202] },
  "deck/tiqms-tablet.jpg": { src: "p10-0-1536x1024.png" },
  "deck/bit-rig.jpg": { src: "p11-0-1536x1024.png", crop: [700, 0, 836, 700] },
};

// Stock media from Pexels (Pexels License: free commercial use, no attribution required). Source files in ../scrape/stock.
//   rig-dusk.jpg    pexels.com/photo/15973758  (GANESH RAMSUMAIR)
//   pipe-yard.jpg   pexels.com/photo/33791802  (Shuaizhi Tian)
//   plant-night.jpg pexels.com/photo/10407689  (Tom Fisk)
//   rig-hero.mp4    pexels.com/video/34294261  (Dio Hasbi Saniskoro)
//   pipe-detail.mp4 pexels.com/video/32063227  (TimePRO TV)
// Video posters (public/media/video/*.jpg) are frames grabbed from these clips in a browser.
const STOCK_SRC = path.resolve(SRC, "../stock");
const STOCK = ["stock/rig-dusk.jpg", "stock/pipe-yard.jpg", "stock/plant-night.jpg"];
const STOCK_VIDEOS = ["video/rig-hero.mp4", "video/pipe-detail.mp4"];

const ensure = (p) => fs.mkdirSync(path.dirname(p), { recursive: true });

for (const dest of STOCK) {
  const out = path.join(OUT, dest);
  ensure(out);
  await sharp(path.join(STOCK_SRC, path.basename(dest))).resize(2000, 2000, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
}
for (const dest of STOCK_VIDEOS) {
  const out = path.join(OUT, dest);
  ensure(out);
  fs.copyFileSync(path.join(STOCK_SRC, path.basename(dest)), out);
}

for (const [dest, { src, crop }] of Object.entries(DECK)) {
  const out = path.join(OUT, dest);
  ensure(out);
  let pipe = sharp(path.join(DECK_SRC, src)).flatten({ background: "#0b1230" });
  if (crop) pipe = pipe.extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] });
  await pipe.jpeg({ quality: 86, mozjpeg: true }).toFile(out);
}

for (const [dest, src] of Object.entries(MAP)) {
  const out = path.join(OUT, dest);
  ensure(out);
  await sharp(img(src)).rotate().flatten({ background: "#ffffff" }).resize(2000, 2000, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
}
for (const [dest, src] of Object.entries(LOGOS)) {
  const out = path.join(OUT, dest);
  ensure(out);
  await sharp(img(src)).trim({ threshold: 12 }).resize(900, 900, { fit: "inside", withoutEnlargement: true }).png().toFile(out);
}
// Light variant of the logo for dark surfaces: charcoal lettering turns white, the navy gear lifts to a readable blue.
{
  const { data, info } = await sharp(path.join(OUT, "brand/logo.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (b > r + 40) [data[i], data[i + 1], data[i + 2]] = [118, 140, 255];
    else if (Math.max(r, g, b) < 150) [data[i], data[i + 1], data[i + 2]] = [255, 255, 255];
  }
  await sharp(data, { raw: info }).png().toFile(path.join(OUT, "brand/logo-light.png"));
}
for (const [dest, src] of Object.entries(VIDEOS)) {
  const out = path.join(OUT, dest);
  ensure(out);
  fs.copyFileSync(path.join(SRC, "videos", src), out);
}
console.log(`images ${Object.keys(MAP).length}, logos ${Object.keys(LOGOS).length}, videos ${Object.keys(VIDEOS).length}`);

// Intrinsic sizes let galleries render photos at their natural aspect ratio (no cropping).
const sizes = {};
for (const dest of [...Object.keys(MAP), ...Object.keys(DECK), ...STOCK].sort()) {
  const { width, height } = await sharp(path.join(OUT, dest)).metadata();
  sizes[`/media/${dest}`] = [width, height];
}
const rows = Object.entries(sizes).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
fs.writeFileSync(path.resolve("src/content/media-sizes.json"), `{\n${rows.join(",\n")}\n}\n`);
console.log(`sizes ${Object.keys(sizes).length}`);

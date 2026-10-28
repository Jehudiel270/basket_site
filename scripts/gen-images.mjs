import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const OUT = '/home/z/my-project/public/img';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const portraits = [
  { f: 'player-1.jpg', d: 'young Beninese male point guard, short hair, jersey number 4' },
  { f: 'player-2.jpg', d: 'tall Ivorian female shooting guard with braids, jersey number 9' },
  { f: 'player-3.jpg', d: 'athletic Togolese male small forward with low fade haircut, beard, jersey number 7' },
  { f: 'player-4.jpg', d: 'young Senegalese female point guard with short afro, jersey number 11' },
  { f: 'player-5.jpg', d: 'powerful Cameroonian male power forward, muscular arms, jersey number 23' },
  { f: 'player-6.jpg', d: 'Burkinabe male center, very tall, serious expression, jersey number 15' },
];

const scenes = [
  { f: 'hero-court.jpg', s: '1344x768', d: 'dramatic indoor basketball arena at night, empty glossy court with orange LED line accents, basketball on free throw line, dark moody atmosphere, cinematic volumetric spotlights from above, orange and charcoal color palette, photorealistic, high quality' },
  { f: 'action-dunk.jpg', s: '1344x768', d: 'African basketball player mid-air dunking on professional hoop, dramatic dark arena, orange rim light, motion energy, low angle shot, photorealistic sports photography, high quality' },
  { f: 'academy.jpg', s: '1344x768', d: 'basketball academy training session in West Africa, young players practicing drills on outdoor court at golden hour, coach with clipboard, inspiring atmosphere, photorealistic, high quality' },
  { f: 'event-arena.jpg', s: '1344x768', d: 'basketball combine event, athletic testing stations with cones and players, indoor sports hall, orange branding accents, professional event photography, high quality' },
  { f: 'club-hq.jpg', s: '1344x768', d: 'modern basketball club facility entrance with indoor court visible, dark architecture with orange signage lights, professional sports club, photorealistic, high quality' },
];

async function gen(zai, { f, s = '864x1152', d }) {
  try {
    const prompt = `${d}, dark charcoal studio background, dramatic orange rim lighting, professional sports photography, looking at camera, confident expression, high quality, detailed`;
    const response = await zai.images.generations.create({ prompt, size: s });
    const b64 = response.data[0].base64;
    fs.writeFileSync(`${OUT}/${f}`, Buffer.from(b64, 'base64'));
    console.log('OK', f);
  } catch (e) {
    console.error('FAIL', f, e.message);
  }
}

const zai = await ZAI.create();
for (const p of portraits.slice(99)) await gen(zai, p);
for (const s of scenes.filter(x => x.f === 'hero-court.jpg')) await gen(zai, s);
console.log('DONE');

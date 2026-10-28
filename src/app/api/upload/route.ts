import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '@/lib/auth';

/**
 * Signature d'upload Cloudinary (mode signé, dossier "courtlink/<type>").
 * Le client envoie ensuite le fichier DIRECTEMENT vers Cloudinary avec
 * cette signature — le fichier ne transite jamais par ce serveur.
 *
 * Répond 501 si les clés Cloudinary ne sont pas encore configurées.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Session requise pour uploader un média.' }, { status: 401 });
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: 'Cloudinary non configuré — ajoutez les clés dans .env.' }, { status: 501 });
  }

  const body = await req.json().catch(() => ({}));
  const kind = ['photos', 'videos', 'documents'].includes(String(body.kind)) ? String(body.kind) : 'documents';

  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET });

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `courtlink/${kind}`;
  /* Limite : 100 Mo — photos de profil, extraits vidéo, documents de vérification */
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, CLOUDINARY_API_SECRET);

  return NextResponse.json({ cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, timestamp, signature, folder });
}

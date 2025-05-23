import { v2 as cloudinary } from "cloudinary";

import https from "https";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_SECRET,
})



export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const public_id = searchParams.get('public_id');

  if (!public_id) {
    return new Response(JSON.stringify({ message: 'Missing public_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const signedUrl = cloudinary.url(public_id, {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 10800, // 3 hours
  });

  // Fetch the video from Cloudinary
  const cloudinaryRes = await fetch(signedUrl);

  if (!cloudinaryRes.ok) {
    return new Response(JSON.stringify({ message: 'Failed to stream video' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Stream it through your server
  return new Response(cloudinaryRes.body, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'inline', // optional: don't download
    },
  });
}

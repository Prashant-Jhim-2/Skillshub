import { v2 as cloudinary } from "cloudinary";

import https from "https";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_SECRET,
})

export const POST = async (req) =>{
    const body = await req.json() 
    const {public_id} = body 
    if (!public_id) {
        return new Response(JSON.stringify({status:false}), {
          status: 400,
        });
      }
    else {
        // Signed URL valid for 3 hours (3 * 60 * 60 = 10800 seconds)
         const expiresAt = Math.floor(Date.now() / 1000) + 10800;

        const url = cloudinary.url(public_id, {
         resource_type: 'video',
         type: 'authenticated',
         sign_url: true,
         secure: true,
         expires_at: expiresAt,
         });
         return new Response(JSON.stringify({url}))
        }
}
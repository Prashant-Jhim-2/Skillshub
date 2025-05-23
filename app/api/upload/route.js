import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_SECRET,
})

export const config = {
    api:{
        bodyParser:{
            sizeLimit:"200mb"
        }
    }
}
export const POST = async (req) => {
    try {
      const body = await req.json();
      const { file } = body;
  
      if (!file) {
        return new Response(JSON.stringify({ message: 'No file provided' }), {
          status: 400,
        });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: 'video',
        type: 'authenticated',
        folder: 'videos',
      });
  
      return new Response(
        JSON.stringify({
          public_id: uploadResponse.public_id,
          secure_url: uploadResponse.secure_url,
        }),
        { status: 200 }
      );
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Upload failed', error: error.message }), {
        status: 500,
      });
    }
  };
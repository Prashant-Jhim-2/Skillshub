import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, index, file, courseId } = data;

    // Convert base64 to buffer
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'educorner/pdfs',
          public_id: `${courseId}_${index}_${title}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Return the PDF URL
    return NextResponse.json({
      status: true,
      Details: {
        title,
        index,
        pdfUrl: uploadResponse.secure_url,
        publicId: uploadResponse.public_id
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      status: false,
      error: 'Failed to upload PDF'
    }, { status: 500 });
  }
} 
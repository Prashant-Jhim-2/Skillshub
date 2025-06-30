/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["unsplash.com",'images.pexels.com','static.wixstatic.com',"images8.alphacoders.com","firebasestorage.googleapis.com",'scontent-yyz1-1.cdninstagram.com',"static.wikia.nocookie.net",'www.wordstream.com'] // Add the hostname of your image source
    },
    webpack: (config, { isServer }) => {
        // Handle PDF.js dependencies
        config.resolve.fallback = {
            ...config.resolve.fallback,
            canvas: false,
            fs: false,
            path: false,
        };
        
        return config;
    },
};

export default nextConfig;

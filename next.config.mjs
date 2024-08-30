/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/profile_images/1822228494383718400/OBTjXZnJ_400x400.jpg',
      },
    ],
  },
};

export default nextConfig;

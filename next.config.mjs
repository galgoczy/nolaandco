/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // A régi, csomagalapú ajándékkártya helyét az új fix összegű digitális
      // ajándékkártya vette át.
      {
        source: '/termekek/nola-ajandekkartya',
        destination: '/termekek/nola-digitalis-ajandekkartya',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;

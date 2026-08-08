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
    // Az optimalizált változatok élettartama. A Next alapértéke 60 másodperc,
    // ami után a képet újra kell transzformálni — ez okozta a termékgalériák
    // időnkénti 2-3 másodperces első betöltését. Az adminból feltöltött képek
    // addRandomSuffix-szal kapnak URL-t, tehát új feltöltés új URL-t jelent,
    // így elavult cache nem fordulhat elő.
    minimumCacheTTL: 2678400, // 31 nap
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

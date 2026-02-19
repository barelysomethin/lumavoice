/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/tts',
          destination: 'http://127.0.0.1:3001',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

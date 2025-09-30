import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'theBulletinTracker',
    short_name: 'BulletinTracker',
    description: 'Track job locations, hours, and generate reports.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E5F3FF',
    theme_color: '#30A2FF',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
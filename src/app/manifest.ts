import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TimeSlip Search',
        short_name: 'TimeSlip',
        description: 'A conversational cultural time machine - explore any moment in history',
        start_url: '/',
        display: 'standalone',
        background_color: '#0d0d0d',
        theme_color: '#0d0d0d',
        icons: [
            {
                src: '/opengraph-image.png',
                sizes: '1200x630',
                type: 'image/png',
            },
        ],
    }
}

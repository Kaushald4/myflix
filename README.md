# StreamFlix Web

A modern web application for streaming movies and TV series, built with Next.js. This project provides a user-friendly interface to browse, watch, and manage your favorite content with features like watchlists, watch history, and downloads.

## Disclaimer

**Important Legal Notice**: This application does not host any video content. It acts as a client-side scraper and proxy for publicly available streaming sources. All content is sourced from third-party websites. Users are responsible for ensuring compliance with local laws and copyright regulations when using this application. The developers are not liable for any misuse or infringement.

## Features

- **Browse Content**: Discover movies and TV series with a clean catalog interface
- **Streaming Player**: Integrated video player for seamless content playback
- **Watchlist**: Save movies and series for later viewing
- **Watch History**: Track your viewing progress and history
- **Downloads**: Download content for offline viewing using FFmpeg for video processing
- **Responsive Design**: Optimized for desktop and mobile devices
- **Authentication**: User authentication system
- **API Integration**: Proxy streaming APIs for content delivery

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives via shadcn/ui
- **Video Processing**: FFmpeg integration
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Theming**: next-themes for dark/light mode

## Prerequisites

- Node.js 18 or later
- npm, yarn, pnpm, or bun

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd streamflix-web
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables (if needed):
   Create a `.env.local` file in the root directory and add any required environment variables. For example:
   ```
   NEXT_PUBLIC_WEB_URL=http://localhost:3000
   ```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Build

Build the application for production:

```bash
npm run build
```

## Start Production Server

Start the production server:

```bash
npm start
```

## Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

## Project Structure

```
streamflix-web/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── proxy-stream/  # Streaming proxy endpoint
│   │   └── stream/        # Stream handling endpoint
│   ├── downloads/         # Downloads page
│   ├── history/           # Watch history page
│   ├── movies/            # Movies catalog
│   ├── series/            # TV series catalog
│   ├── watch/             # Watch page with player
│   ├── watchlist/         # User watchlist
│   └── [type]/[id]/       # Dynamic routes for content
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── provider/             # Context providers
├── store/                # Zustand stores
└── public/               # Static assets
```

## API Endpoints

- `GET /api/stream?url=<content-url>`: Handles streaming playlists and proxies content
- `GET /api/proxy-stream?url=<segment-url>`: Proxies video segments

## Downloads

The application supports downloading video content for offline viewing. Downloads are processed using FFmpeg, which allows for:

- Converting video streams to various formats
- Optimizing file sizes
- Ensuring compatibility with different devices
- Handling HLS (HTTP Live Streaming) segments

Downloaded files are stored locally on the user's device. Note that download functionality depends on browser capabilities and may require additional permissions.

## Key Components

- **Player**: Main video player component
- **WatchPlayer**: Specialized player for watch pages
- **CatalogPage**: Reusable catalog for movies/series
- **MovieCard**: Card component for content display
- **AuthProvider**: Authentication context provider

## State Management

The application uses Zustand for state management with the following stores:

- `useMovieStore`: Movie-related state
- `useWatchHistoryStore`: Watch history management
- `useWatchlistStore`: Watchlist functionality

## Styling

- Uses Tailwind CSS for utility-first styling
- shadcn/ui for consistent component library
- Responsive design with mobile-first approach
- Dark/light theme support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is private and proprietary.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

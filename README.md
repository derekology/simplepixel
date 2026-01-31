# Simple Pixel

Privacy-first, simple visitor tracking for small businesses and individuals.

## Features

- 🚀 **Dead Simple**: No complex setup, no accounts, no configuration
- 🔒 **Privacy First**: IP addresses are hashed immediately and never stored in plain text
- 📊 **Just What You Need**: Track visitors, device types, locations, and custom parameters
- 🐳 **Docker Ready**: Easy deployment with Docker and Docker Compose

## Quick Start with Docker

### One-Command Start (Easiest)

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

This will automatically:
- Check if Docker is installed and running
- Create `.env` file from template
- Build the Docker image
- Start the application
- Show you the URL to access Simple Pixel

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd simple-pixel
```

2. (Optional) Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your preferred settings
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the application at `http://localhost:3000`

### Using Docker

Build and run the container:
```bash
docker build -t simple-pixel .
docker run -d \
  -p 3000:3000 \
  -v simple-pixel-data:/app/data \
  -e HOST_NAME=localhost:3000 \
  --name simple-pixel \
  simple-pixel
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST_NAME` | `localhost:3000` | Hostname for redirects |
| `DB_PATH` | `/app/data/simple-pixel.db` | Database file path |
| `CLEANUP_INTERVAL_MINUTES` | `60` | How often to check for expired pixels |
| `PIXEL_EXPIRY_DAYS` | `7` | Days until pixel expires |
| `NODE_ENV` | `production` | Node environment |

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd src/frontend
npm install
cd ../..
```

3. Build the frontend:
```bash
npm run build:frontend
```

4. Start the development server:
```bash
npm run dev
```

## Building for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## How It Works

1. **Create a Pixel**: Visit `/create-pixel` to generate a unique tracking pixel
2. **Embed the Pixel**: Add the pixel image to your website, email, or landing page
3. **View Stats**: Access your pixel's dashboard to see visitor analytics

## Data Retention

⚠️ **Important**: Pixels and all associated event data are automatically deleted 7 days after creation (configurable via `PIXEL_EXPIRY_DAYS`).

## Privacy

- IP addresses are hashed using SHA-256 and never stored in plain text
- User agent strings are parsed for device info and then discarded
- No cookies or cross-site tracking
- Minimal data collection

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: Vue 3, Vite, TypeScript
- **Database**: SQLite (better-sqlite3)
- **Geolocation**: geoip-lite
- **Charts**: Chart.js
- **Maps**: Leaflet

## License

ISC

## Disclaimer

Simple Pixel is provided "as-is" without any warranties or guarantees. Users are responsible for ensuring compliance with all applicable privacy laws and regulations (GDPR, CCPA, etc.) in their jurisdiction.

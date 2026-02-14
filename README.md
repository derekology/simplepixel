# Simple Pixel

Privacy-first, simple visitor tracking for small businesses and individuals.

## Features

- 🚀 **Dead Simple**: No complex setup, no accounts, no configuration
- 🔒 **Privacy First**: IP addresses are hashed immediately and never stored in plain text
- 📊 **Just What You Need**: Track visitors, device types, locations, and custom parameters
- 🐳 **Docker Ready**: Easy deployment with Docker and Docker Compose
- 🛡️ **Secure by Default**: Rate limiting, input validation, and security headers included

## Quick Start with Docker

### Easiest: Pre-built Docker Image (No Clone Required!)

```bash
# Create directory
mkdir simplepixel && cd simplepixel

# Download docker-compose file
curl -O https://raw.githubusercontent.com/derekology/simplepixel/main/docker-compose.hub.yml -o docker-compose.yml

# Start (uses defaults: port 3000, 7-day expiry)
docker compose up -d
```

Access at `http://localhost:3000` - that's it! 🎉

### For Development: One-Command Start

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

### Building from Source

1. Clone the repository:

```bash
git clone https://github.com/derekology/simplepixel
cd simplepixel
```

2. (Optional) Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your preferred settings
```

3. Start the application:

```bash
docker compose up -d
```

4. Access the application at `http://localhost:3000` (or your configured PORT from `.env`)

### Using Docker

Build and run the container:

```bash
docker build -t simplepixel .
docker run -d \
  -p 3000:3000 \
  -v simplepixel-data:/app/data \
  -e PORT=3000 \
  --name simplepixel \
  simplepixel
```

**Note:** Adjust the port mapping as needed (e.g., `-p 8080:8080 -e PORT=8080`).

## Environment Variables

| Variable                   | Default                    | Description                           |
| -------------------------- | -------------------------- | ------------------------------------- |
| `PORT`                     | `3000`                     | Server port                           |
| `DB_PATH`                  | `/app/data/simplepixel.db` | Database file path                    |
| `CLEANUP_INTERVAL_MINUTES` | `60`                       | How often to check for expired pixels |
| `PIXEL_EXPIRY_DAYS`        | `7`                        | Days until pixel expires              |
| `NODE_ENV`                 | `production`               | Node environment                      |

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

The server will start with hot-reload enabled. Any changes to TypeScript files will automatically restart the server.

**Alternative commands:**

- `npm run dev:nodemon` - Use nodemon for watching
- `npm run dev:inspect` - Start with debugger attached

**Note:** If you encounter issues with nodemon or TypeScript imports, see [DEV_SETUP.md](DEV_SETUP.md) for detailed explanation and solutions.

## Building for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## How It Works

1. **Create a Pixel**: Visit the home page to generate a unique tracking pixel
2. **Embed the Pixel**: Add the pixel image to your website, email, or landing page
3. **View Stats**: Access your pixel's dashboard to see visitor analytics

## Data Retention

⚠️ **Important**: Pixels and all associated event data are automatically deleted 7 days after creation (configurable via `PIXEL_EXPIRY_DAYS`).

## Privacy

- IP addresses are hashed using SHA-256 and never stored in plain text
- User agent strings are parsed for device info and then discarded
- No cookies or cross-site tracking
- Minimal data collection

## Security

Simple Pixel includes comprehensive security features:

- **Rate Limiting**: Protects against abuse (works with Cloudflare proxy)
- **Input Validation**: All pixel IDs are validated as proper UUIDs
- **Security Headers**: Helmet middleware for XSS and clickjacking protection
- **Cloudflare Ready**: Designed to work behind Cloudflare's proxy with proper IP detection

See [SECURITY.md](SECURITY.md) for detailed security information and configuration options.

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

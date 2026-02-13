# Security

## Security Features

Simple Pixel includes multiple layers of security hardening to protect against common attacks:

### Rate Limiting

All endpoints are protected with rate limiting that works correctly behind Cloudflare's proxy:

- **Pixel Creation (`/`)**: 5 requests per minute per IP
  - Prevents abuse of the pixel generation system
- **Pixel Tracking (`/p/:pixelId.gif`)**: 1000 requests per minute per pixel ID
  - Allows legitimate tracking while preventing spam
  - Rate limit is per pixel, not per IP, to accommodate real traffic
  - Suitable for landing pages with moderate traffic spikes
- **API Endpoints (`/stats/:pixelId`, `/delete/:pixelId`)**: 20 requests per minute per IP
  - Protects against stats harvesting and deletion spam

### Security Headers (Helmet)

The application uses Helmet middleware to set secure HTTP headers:

- Content Security Policy (CSP) to prevent XSS attacks
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME sniffing
- And other security headers

### Input Validation

- **UUID Validation**: All pixel IDs are validated to be proper UUIDs
- **Parameter Limiting**: Query parameters are limited to prevent database bloat (see `MAX_PARAMS` in schema)
- **Type Checking**: TypeScript provides compile-time type safety

### Privacy Features

- **IP Hashing**: IP addresses are immediately hashed with SHA-256 and never stored in plain text
- **User Agent Parsing**: User agent strings are parsed for device info and discarded
- **No Cookies**: No cookies or persistent identifiers are used
- **Minimal Data**: Only essential tracking data is collected

### Proxy Integration

The application works both behind proxies (like Cloudflare) and direct connections:

- `trust proxy` is set to `1` (trusts first proxy hop only)
- Custom keyGenerator handles `X-Forwarded-For` headers when behind Cloudflare
- Falls back to direct connection IP when not behind a proxy
- Works correctly in both scenarios without code changes

## Recommendations for Production

1. **Enable Cloudflare Rate Limiting**: Add additional rate limiting rules in Cloudflare for extra protection
2. **Use HTTPS**: Always serve over HTTPS (Cloudflare provides this)
3. **Monitor Logs**: Watch for suspicious patterns in your logs
4. **Regular Updates**: Keep dependencies updated with `npm audit` and `npm update`
5. **Database Backups**: Regularly backup your SQLite database
6. **Environment Variables**: Never commit `.env` files with sensitive data

## Adjusting Rate Limits

You can adjust the rate limits in `src/server/server.ts`:

```typescript
const pixelCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // Time window in milliseconds
  max: 5, // Max requests per window
  // ...
});
```

## Reporting Security Issues

If you discover a security vulnerability, please report it privately to the repository maintainer rather than opening a public issue.

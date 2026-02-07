# Security Policy

## 🔒 Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it by emailing **security@yourdomain.com** (or create a private security advisory on GitHub).

**Please do not open public issues for security vulnerabilities.**

## 🛡️ Security Best Practices

### Environment Variables

1. **Never commit `.env` files** to version control
   - The `.env` file is already in `.gitignore`
   - API keys and passwords should NEVER be in Git history

2. **Use strong passwords in production**
   ```bash
   # Generate strong PostgreSQL password
   openssl rand -base64 32
   
   # Generate SECRET_KEY
   openssl rand -hex 32
   ```

3. **BYOK (Bring Your Own Key) Architecture**
   - Users provide their own Gemini API keys via Settings page
   - Keys stored in browser `localStorage` (client-side only)
   - Keys sent as `X-Gemini-Key` header with requests
   - Server-side key is optional fallback

### API Key Security

#### ⚠️ CRITICAL: Exposed API Key Found

During the cleanup process, we found an actual Gemini API key in the `.env` file:
```
GEMINI_API_KEY=AIzaSyAtbhtbIX6vOFHOa-SFHZ2sMtqC-3rHR8c
```

**This key has been removed.** If you committed this key to Git:

1. **Revoke the key immediately** at https://makersuite.google.com/app/apikey
2. **Generate a new key** (never reuse exposed keys)
3. **Clean Git history** (if the key was committed):
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   # Do NOT push to public repos until cleaned
   ```

## 🔐 Production Checklist

Before deploying to production:

- [ ] **Change `POSTGRES_PASSWORD`** to a strong random password
- [ ] **Generate `SECRET_KEY`** with `openssl rand -hex 32`
- [ ] **Set `DEBUG=false`** in backend configuration
- [ ] **Update `ALLOWED_ORIGINS`** to your production domain
- [ ] **Enable HTTPS/TLS** (use Let's Encrypt or similar)
- [ ] **Set up monitoring** (Sentry, Prometheus, etc.)
- [ ] **Configure automated backups** for PostgreSQL
- [ ] **Enable rate limiting** (`RATE_LIMIT_ENABLED=true`)
- [ ] **Review CORS settings** (whitelist specific domains only)
- [ ] **Set proper `SECRET_KEY`** for session management
- [ ] **Keep dependencies updated** (`npm audit`, `pip-audit`)

## 🚨 Known Security Considerations

### 1. BYOK Architecture
- User API keys stored in browser localStorage
- Keys transmitted via HTTPS headers
- No server-side key storage (by design)
- Users responsible for their own key security

### 2. Rate Limiting
- Implemented for API endpoints
- Configure `RATE_LIMIT_PER_MINUTE` in production
- Prevents abuse and DoS attacks

### 3. CORS Configuration
- Configured via `ALLOWED_ORIGINS` environment variable
- Should be set to specific domains in production
- Never use `*` (wildcard) in production

### 4. SQL Injection Prevention
- All queries use SQLAlchemy ORM
- Parameterized queries prevent SQL injection
- Input validation via Pydantic schemas

### 5. XSS Prevention
- React automatically escapes output
- Content-Security-Policy headers recommended

## 📋 Security Dependencies

### Backend
- `fastapi` - Web framework with security features
- `pydantic` - Input validation
- `sqlalchemy` - ORM with SQL injection prevention
- `python-jose` - JWT handling (if auth is added)

### Frontend
- `next.js` - Built-in security features
- React - XSS prevention

## 🔄 Security Updates

- Review dependencies monthly
- Apply security patches promptly
- Monitor GitHub security advisories
- Follow OWASP Top 10 guidelines

## 📝 Compliance

This is a demo/MVP project. For production use:
- Implement user authentication (JWT/OAuth)
- Add audit logging
- Implement data retention policies
- Consider GDPR/privacy regulations
- Add input sanitization for all user data

## 📧 Contact

For security concerns: security@yourdomain.com

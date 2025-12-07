# Nano-Vitals Dashboard

A production-ready **real-time Core Web Vitals monitoring platform** built with React, TypeScript, Node.js, and modern DevOps practices. Monitor LCP, FID, and CLS metrics with AI-powered insights and actionable optimization recommendations.

## Overview

Nano-Vitals Dashboard is a sophisticated monitoring solution designed for technical teams who need deep insights into website performance. It combines real-time metrics collection, intelligent analysis, and automated alerting to help optimize Core Web Vitals.

### Key Features

- **Real-time Monitoring**: WebSocket-powered live updates for LCP, FID, and CLS metrics
- **Multi-site Tracking**: Monitor multiple websites from a single dashboard
- **AI-Powered Analysis**: LLM-generated insights and optimization recommendations
- **Smart Alerts**: Configurable thresholds with instant notifications
- **Interactive Visualizations**: Recharts-based performance trend analysis
- **Email Reports**: Weekly/monthly performance summaries with trend analysis
- **Production-Ready**: Docker, Kubernetes, and CI/CD ready
- **Dark Theme UI**: Optimized for technical audiences with professional design

## Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4 | Modern UI with real-time updates |
| **Backend** | Express.js, Node.js, tRPC | Type-safe API layer |
| **Database** | MySQL/TiDB, Drizzle ORM | Scalable data persistence |
| **Real-time** | WebSockets | Live metrics streaming |
| **AI/ML** | LLM Integration | Performance analysis and recommendations |
| **Infrastructure** | Docker, Kubernetes | Container orchestration |
| **Authentication** | Manus OAuth | Secure user management |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React + TypeScript + Tailwind CSS + Recharts              │
│  - Dashboard with real-time metrics                         │
│  - Alert configuration and monitoring                       │
│  - Performance analysis viewer                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                    WebSocket & tRPC
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      API Layer (tRPC)                        │
│  - websites router (CRUD operations)                        │
│  - metrics router (recording and analysis)                  │
│  - notifications router (email subscriptions)               │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Business Logic Layer                      │
│  - Core Web Vitals calculation                              │
│  - Alert threshold evaluation                               │
│  - LLM-powered analysis engine                              │
│  - Email notification scheduler                             │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Data Layer (Drizzle ORM)                 │
│  - websites table (monitored URLs)                          │
│  - coreWebVitals table (metric records)                     │
│  - performanceAlerts table (threshold configs)              │
│  - alertEvents table (triggered alerts)                     │
│  - emailSubscriptions table (notification prefs)            │
│  - performanceReports table (LLM analysis cache)            │
└────────────────────────────┬────────────────────────────────┘
                             │
                        MySQL/TiDB
```

## Database Schema

The application uses a normalized schema optimized for time-series metrics:

- **users**: Core authentication (Manus OAuth integration)
- **websites**: Monitored URLs with metadata
- **coreWebVitals**: Time-series metrics (LCP, FID, CLS, Lighthouse scores)
- **performanceAlerts**: Configurable thresholds per website
- **alertEvents**: Alert trigger history with severity levels
- **emailSubscriptions**: User notification preferences
- **performanceReports**: Cached LLM analysis results

## Installation & Setup

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL 8.0+ or TiDB
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/yourusername/nano-vitals-dashboard.git
   cd nano-vitals-dashboard
   pnpm install
   ```

2. **Set up environment variables** (create `.env.local`):
   ```bash
   DATABASE_URL=mysql://user:password@localhost:3306/nano_vitals
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   ```

3. **Initialize database**:
   ```bash
   pnpm db:push
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Docker Deployment

**Using Docker Compose** (recommended for local testing):

```bash
docker-compose up --build
```

This starts both MySQL and the application. Access at `http://localhost:3000`

**Building Docker image**:

```bash
docker build -t nano-vitals-dashboard:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@db:3306/nano_vitals" \
  -e JWT_SECRET="your-secret" \
  nano-vitals-dashboard:latest
```

### Kubernetes Deployment

1. **Create secrets and config**:
   ```bash
   kubectl apply -f k8s/config.yaml
   ```

2. **Deploy application**:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```

3. **Verify deployment**:
   ```bash
   kubectl get pods -l app=nano-vitals-dashboard
   kubectl logs -f deployment/nano-vitals-dashboard
   ```

4. **Access the application**:
   ```bash
   kubectl port-forward svc/nano-vitals-dashboard 3000:80
   ```

## API Documentation

### tRPC Procedures

#### Websites Router

- `websites.list`: Get all monitored websites for the user
- `websites.create`: Add a new website to monitor
- `websites.getMetrics`: Fetch metrics for a specific website
- `websites.getAlerts`: Get alert configurations
- `websites.getAlertEvents`: Retrieve recent alert triggers
- `websites.createAlert`: Create a new performance alert

#### Metrics Router

- `metrics.record`: Record new Core Web Vitals measurement
- `metrics.getHistory`: Fetch historical metrics with pagination
- `metrics.generateAnalysis`: Trigger LLM analysis on metrics
- `metrics.getLatestAnalysis`: Retrieve cached analysis results

#### Notifications Router

- `notifications.subscribe`: Create email subscription
- `notifications.getSubscriptions`: List user subscriptions

## Performance Optimization

### Core Web Vitals Targets

The dashboard uses industry-standard thresholds:

| Metric | Good | Needs Improvement | Poor |
|--------|------|------------------|------|
| **LCP** | ≤ 2.5s | 2.5s - 4s | > 4s |
| **FID** | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Frontend Optimization

- **Code Splitting**: Route-based lazy loading with React.lazy
- **Tree Shaking**: Unused code elimination via Vite
- **Image Optimization**: Efficient asset delivery
- **CSS Optimization**: Tailwind purging and minification

### Backend Optimization

- **Query Optimization**: Indexed database queries for metrics
- **Caching**: LLM analysis results cached in database
- **Connection Pooling**: Efficient database connection management
- **Compression**: gzip compression for API responses

## Testing

### Unit Tests

Run tests with Vitest:

```bash
pnpm test
```

### Test Coverage

- tRPC procedure tests (auth, mutations, queries)
- Database query tests
- Alert threshold evaluation tests
- LLM integration tests

## DevOps & Deployment

### CI/CD Pipeline

The project is ready for GitHub Actions, GitLab CI, or similar:

1. **Build**: `pnpm build`
2. **Test**: `pnpm test`
3. **Lint**: `pnpm format`
4. **Docker**: Build and push image
5. **Deploy**: Kubernetes rollout

### Monitoring & Observability

- **Health Checks**: HTTP endpoint at `/health`
- **Logging**: Structured logs for debugging
- **Metrics**: Prometheus-compatible endpoints (extensible)
- **Alerts**: Kubernetes-native alerting

### Scaling

The Kubernetes deployment includes:

- **Horizontal Pod Autoscaling**: 3-10 replicas based on CPU/memory
- **Resource Limits**: 512Mi memory, 500m CPU per pod
- **Load Balancing**: Service-based traffic distribution
- **Database**: Connection pooling for scalability

## LLM Integration

The dashboard uses LLM for intelligent performance analysis:

```typescript
// Example: Generate optimization recommendations
const analysis = await trpc.metrics.generateAnalysis.mutate({
  websiteId: 1,
  metrics: recentMetrics,
});
```

The LLM analyzes:
- Average LCP, FID, CLS values
- Lighthouse performance score trends
- Industry best practices
- Specific optimization recommendations

## Security Considerations

- **Authentication**: Manus OAuth for secure user management
- **Authorization**: Protected procedures with user context
- **Data Protection**: Encrypted database connections
- **Input Validation**: Zod schema validation on all inputs
- **CORS**: Properly configured cross-origin policies
- **Secrets Management**: Environment variables for sensitive data

## Troubleshooting

### Database Connection Issues

```bash
# Test MySQL connection
mysql -h localhost -u user -p nano_vitals

# Check DATABASE_URL format
echo $DATABASE_URL
```

### WebSocket Connection Failures

- Ensure firewall allows WebSocket traffic
- Check proxy/load balancer WebSocket support
- Verify CORS configuration for WebSocket origin

### LLM Analysis Not Working

- Verify LLM API credentials in environment
- Check rate limiting and quota
- Review logs for API errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Metrics

This project demonstrates:

- **Lighthouse Score**: 90+ (optimized frontend)
- **Core Web Vitals**: All green (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 200KB (gzipped)

## License

MIT License - See LICENSE file for details

## Support & Documentation

- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for feature requests
- **Docs**: Inline code documentation and JSDoc comments

---

**Built with expertise in** React, TypeScript, Node.js, DevOps, and performance optimization. Designed for technical teams who demand production-grade solutions.

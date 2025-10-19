# Services Content Directory

This directory contains YAML-based service definitions that can be bulk-imported into the services database.

## Directory Structure

```
content/
└── vendors/
    └── {vendor-slug}/
        └── services/
            └── {service-slug}/
                ├── card.yaml      # Service card (marketplace listing)
                ├── pricing.yaml   # Pricing tiers
                └── funnel.yaml    # Packages, FAQ, media, compliance
```

## Content Files

### card.yaml
Defines the service card displayed in marketplace listings:
- Service name, tagline, category
- Badges, service areas, city scope
- Rating, reviews, review highlights
- Featured status

### pricing.yaml
Defines pricing tiers:
- Retail price (required)
- Pro member price (optional)
- Co-pay price (optional)
- Savings percentages

### funnel.yaml
Defines the service detail page:
- Packages (tiered offerings)
- FAQ (frequently asked questions)
- Media (images, videos)
- Compliance (disclaimers, RESPA notes)

## Importing Content

### Import a Single Service
```bash
npm run ingest:one VENDOR=acme-inc SERVICE=premium-seo
```

### Import All Services
```bash
npm run ingest:all
```

### Validate Content
```bash
npm run validate:content
```

## Validation

All YAML files are validated against Zod schemas before import:
- `ServiceCardEditSchema` - card.yaml
- `ServicePricingEditSchema` - pricing.yaml
- `ServiceFunnelEditSchema` - funnel.yaml

Invalid files will fail import with detailed error messages.

## Publishing Workflow

1. Create/edit YAML files in content directory
2. Run `npm run ingest:one` or `npm run ingest:all`
3. Content is imported as **draft versions**
4. Use Admin UI to preview and publish drafts
5. Published versions go live immediately

## Best Practices

- Use consistent vendor slugs (kebab-case)
- Use descriptive service slugs
- Keep taglines under 500 characters
- Provide high-quality images (min 800px wide)
- Test locally before bulk import
- Always validate content before import

#!/usr/bin/env node
/**
 * Service Content Ingest CLI
 * Reads YAML files from /content/vendors/ and upserts draft versions to DB
 * 
 * Usage:
 *   npm run ingest:one -- --vendor acme --service social-ads
 *   npm run ingest:all
 *   npm run validate:content
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { resolve, join } from 'path';

// Note: In production, these schemas would be imported from src/contracts/admin/service-version
// For now, we'll do basic validation

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface IngestOptions {
  vendor?: string;
  service?: string;
  publish?: boolean;
  validateOnly?: boolean;
}

async function ingestService(vendorDir: string, serviceDir: string, options: IngestOptions = {}) {
  const contentRoot = resolve(process.cwd(), 'content', 'vendors');
  const servicePath = join(contentRoot, vendorDir, serviceDir);
  
  if (!existsSync(servicePath)) {
    console.error(`❌ Service path not found: ${servicePath}`);
    return false;
  }

  const cardPath = join(servicePath, 'card.yaml');
  const pricingPath = join(servicePath, 'pricing.yaml');
  const funnelPath = join(servicePath, 'funnel.yaml');
  
  try {
    // Read and parse YAML files
    const cardYaml = parse(readFileSync(cardPath, 'utf8'));
    const pricingYaml = existsSync(pricingPath) ? parse(readFileSync(pricingPath, 'utf8')) : {};
    const funnelYaml = existsSync(funnelPath) ? parse(readFileSync(funnelPath, 'utf8')) : null;
    
    // Basic validation
    if (!cardYaml.name || !cardYaml.serviceId) {
      throw new Error('Card must have name and serviceId');
    }

    if (options.validateOnly) {
      console.log(`✅ Valid: ${cardYaml.name}`);
      return true;
    }

    // Upsert draft version
    const { data, error } = await supabase
      .from('service_versions')
      .upsert({
        service_id: cardYaml.serviceId,
        state: options.publish ? 'published' : 'draft',
        card: cardYaml,
        pricing: pricingYaml,
        funnel: funnelYaml,
      })
      .select()
      .single();
    
    if (error) throw error;

    // If publishing, also update the services table pointer
    if (options.publish && data) {
      await supabase
        .from('services')
        .update({ published_version_id: data.id })
        .eq('id', cardYaml.serviceId);
    }
    
    console.log(`✅ Ingested: ${cardYaml.name} (${options.publish ? 'published' : 'draft'})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to ingest ${vendorDir}/${serviceDir}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function ingestAll(options: IngestOptions = {}) {
  const contentRoot = resolve(process.cwd(), 'content', 'vendors');
  
  if (!existsSync(contentRoot)) {
    console.error(`❌ Content directory not found: ${contentRoot}`);
    console.log('💡 Create /content/vendors/[vendor-name]/[service-name]/{card,pricing,funnel}.yaml');
    return;
  }

  const vendors = readdirSync(contentRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let successCount = 0;
  let failCount = 0;

  for (const vendor of vendors) {
    const vendorPath = join(contentRoot, vendor);
    const services = readdirSync(vendorPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const service of services) {
      const success = await ingestService(vendor, service, options);
      if (success) successCount++;
      else failCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed`);
}

// CLI argument parsing
const args = process.argv.slice(2);
const options: IngestOptions = {
  vendor: undefined,
  service: undefined,
  publish: false,
  validateOnly: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--vendor' && args[i + 1]) {
    options.vendor = args[++i];
  } else if (arg === '--service' && args[i + 1]) {
    options.service = args[++i];
  } else if (arg === '--publish') {
    options.publish = true;
  } else if (arg === '--validate') {
    options.validateOnly = true;
  }
}

// Execute
if (options.vendor && options.service) {
  ingestService(options.vendor, options.service, options);
} else if (options.validateOnly) {
  console.log('🔍 Validating all content...');
  ingestAll({ validateOnly: true });
} else {
  console.log('📦 Ingesting all services...');
  ingestAll(options);
}

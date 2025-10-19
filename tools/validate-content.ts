/**
 * Content Validation Tool
 * Validates all YAML service definitions against Zod schemas
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { ServiceCardEditSchema, ServicePricingEditSchema, ServiceFunnelEditSchema } from '../src/contracts/admin/service-version';

const CONTENT_DIR = join(process.cwd(), 'content/vendors');

interface ValidationResult {
  path: string;
  valid: boolean;
  errors?: string[];
}

function validateYAML(filePath: string, schema: any): ValidationResult {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = parse(content);
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { path: filePath, valid: true };
    } else {
      return {
        path: filePath,
        valid: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
  } catch (error) {
    return {
      path: filePath,
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

function findServiceDirs(baseDir: string): string[] {
  const serviceDirs: string[] = [];
  
  try {
    const vendors = readdirSync(baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    for (const vendor of vendors) {
      const vendorPath = join(baseDir, vendor.name);
      const servicesPath = join(vendorPath, 'services');
      
      try {
        const services = readdirSync(servicesPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory());
        
        for (const service of services) {
          serviceDirs.push(join(servicesPath, service.name));
        }
      } catch {
        // No services directory for this vendor
      }
    }
  } catch (error) {
    console.error('Error reading content directory:', error);
  }
  
  return serviceDirs;
}

function main() {
  console.log('🔍 Validating service content...\n');
  
  const serviceDirs = findServiceDirs(CONTENT_DIR);
  const results: ValidationResult[] = [];
  
  for (const serviceDir of serviceDirs) {
    const cardPath = join(serviceDir, 'card.yaml');
    const pricingPath = join(serviceDir, 'pricing.yaml');
    const funnelPath = join(serviceDir, 'funnel.yaml');
    
    // Validate card
    results.push(validateYAML(cardPath, ServiceCardEditSchema));
    
    // Validate pricing
    results.push(validateYAML(pricingPath, ServicePricingEditSchema));
    
    // Validate funnel
    results.push(validateYAML(funnelPath, ServiceFunnelEditSchema));
  }
  
  // Print results
  const valid = results.filter(r => r.valid);
  const invalid = results.filter(r => !r.valid);
  
  console.log(`✅ Valid: ${valid.length}`);
  console.log(`❌ Invalid: ${invalid.length}\n`);
  
  if (invalid.length > 0) {
    console.log('Validation Errors:\n');
    for (const result of invalid) {
      console.log(`\n${result.path}`);
      result.errors?.forEach(err => console.log(`  - ${err}`));
    }
    process.exit(1);
  } else {
    console.log('✨ All content is valid!');
    process.exit(0);
  }
}

main();

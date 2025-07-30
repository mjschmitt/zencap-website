/**
 * @fileoverview Virus scanning utilities for file uploads
 * @module utils/virus-scanner
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import winston from 'winston';
import { FILE_SECURITY } from '../config/security.js';

const execAsync = promisify(exec);

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Scan file for viruses using ClamAV
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @returns {Promise<Object>} Scan results
 */
export async function scanWithClamAV(buffer, filename) {
  const tempDir = '/tmp/virus-scan';
  const tempFile = path.join(tempDir, `scan_${Date.now()}_${filename}`);
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write buffer to temp file
    await fs.writeFile(tempFile, buffer);
    
    // Run ClamAV scan
    const { stdout, stderr } = await execAsync(
      `clamscan --no-summary "${tempFile}"`,
      { timeout: FILE_SECURITY.virusScan.timeout }
    );
    
    // Parse results
    const isClean = stdout.includes('OK') && !stdout.includes('FOUND');
    const threats = [];
    
    if (!isClean) {
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('FOUND')) {
          const [, threat] = line.split(':');
          threats.push(threat.trim());
        }
      }
    }
    
    return {
      clean: isClean,
      threats,
      scanner: 'clamav',
      scanTime: new Date()
    };
    
  } catch (error) {
    logger.error('ClamAV scan error:', error);
    throw new Error('Virus scan failed');
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Scan file using Windows Defender (Windows only)
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @returns {Promise<Object>} Scan results
 */
export async function scanWithWindowsDefender(buffer, filename) {
  if (process.platform !== 'win32') {
    throw new Error('Windows Defender is only available on Windows');
  }
  
  const tempDir = process.env.TEMP || '/tmp';
  const tempFile = path.join(tempDir, `scan_${Date.now()}_${filename}`);
  
  try {
    // Write buffer to temp file
    await fs.writeFile(tempFile, buffer);
    
    // Run Windows Defender scan
    const { stdout, stderr } = await execAsync(
      `"C:\\Program Files\\Windows Defender\\MpCmdRun.exe" -Scan -ScanType 3 -File "${tempFile}"`,
      { timeout: FILE_SECURITY.virusScan.timeout }
    );
    
    // Check if threats were found
    const isClean = !stdout.includes('found') && !stderr.includes('found');
    
    return {
      clean: isClean,
      threats: isClean ? [] : ['Threat detected'],
      scanner: 'windows-defender',
      scanTime: new Date()
    };
    
  } catch (error) {
    logger.error('Windows Defender scan error:', error);
    throw new Error('Virus scan failed');
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Scan file using VirusTotal API
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @returns {Promise<Object>} Scan results
 */
export async function scanWithVirusTotal(buffer, filename) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  
  if (!apiKey) {
    throw new Error('VirusTotal API key not configured');
  }
  
  try {
    // Calculate file hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // First, check if file is already scanned
    const reportResponse = await fetch(
      `https://www.virustotal.com/api/v3/files/${hash}`,
      {
        headers: {
          'x-apikey': apiKey
        }
      }
    );
    
    if (reportResponse.ok) {
      const report = await reportResponse.json();
      const stats = report.data.attributes.last_analysis_stats;
      
      return {
        clean: stats.malicious === 0 && stats.suspicious === 0,
        threats: report.data.attributes.last_analysis_results
          ? Object.entries(report.data.attributes.last_analysis_results)
              .filter(([, result]) => result.category === 'malicious')
              .map(([engine, result]) => `${engine}: ${result.result}`)
          : [],
        scanner: 'virustotal',
        scanTime: new Date(report.data.attributes.last_analysis_date * 1000),
        stats
      };
    }
    
    // If not found, upload file for scanning
    if (buffer.length > 32 * 1024 * 1024) {
      // Use large file upload for files > 32MB
      throw new Error('Large file upload not implemented');
    }
    
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), filename);
    
    const uploadResponse = await fetch(
      'https://www.virustotal.com/api/v3/files',
      {
        method: 'POST',
        headers: {
          'x-apikey': apiKey
        },
        body: formData
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to VirusTotal');
    }
    
    const uploadResult = await uploadResponse.json();
    const analysisId = uploadResult.data.id;
    
    // Poll for results (in production, use webhooks)
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const analysisResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            'x-apikey': apiKey
          }
        }
      );
      
      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        
        if (analysis.data.attributes.status === 'completed') {
          const stats = analysis.data.attributes.stats;
          
          return {
            clean: stats.malicious === 0 && stats.suspicious === 0,
            threats: [],
            scanner: 'virustotal',
            scanTime: new Date(),
            stats
          };
        }
      }
      
      attempts++;
    }
    
    throw new Error('VirusTotal scan timeout');
    
  } catch (error) {
    logger.error('VirusTotal scan error:', error);
    throw new Error('Virus scan failed');
  }
}

/**
 * Scan file using configured scanner
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @returns {Promise<Object>} Scan results
 */
export async function scanFile(buffer, filename) {
  const { provider, enabled } = FILE_SECURITY.virusScan;
  
  if (!enabled) {
    return {
      clean: true,
      threats: [],
      scanner: 'none',
      scanTime: new Date(),
      skipped: true
    };
  }
  
  try {
    switch (provider) {
      case 'clamav':
        return await scanWithClamAV(buffer, filename);
      
      case 'windows-defender':
        return await scanWithWindowsDefender(buffer, filename);
      
      case 'virustotal':
        return await scanWithVirusTotal(buffer, filename);
      
      default:
        throw new Error(`Unknown virus scanner: ${provider}`);
    }
  } catch (error) {
    logger.error(`Virus scan failed with ${provider}:`, error);
    
    // Try fallback scanner if available
    if (provider !== 'clamav' && process.platform === 'linux') {
      logger.info('Falling back to ClamAV');
      return await scanWithClamAV(buffer, filename);
    }
    
    throw error;
  }
}

/**
 * Quarantine infected file
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @param {Object} scanResults - Scan results
 * @returns {Promise<string>} Quarantine path
 */
export async function quarantineFile(buffer, filename, scanResults) {
  const quarantinePath = FILE_SECURITY.virusScan.quarantinePath;
  
  try {
    // Ensure quarantine directory exists
    await fs.mkdir(quarantinePath, { recursive: true });
    
    // Generate quarantine filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 8);
    const quarantineFilename = `${timestamp}_${hash}_${filename}.quarantine`;
    const fullPath = path.join(quarantinePath, quarantineFilename);
    
    // Create quarantine metadata
    const metadata = {
      originalFilename: filename,
      detectionTime: scanResults.scanTime,
      threats: scanResults.threats,
      scanner: scanResults.scanner,
      fileSize: buffer.length,
      sha256: crypto.createHash('sha256').update(buffer).digest('hex')
    };
    
    // Encrypt file before storing in quarantine
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Save encrypted file
    await fs.writeFile(fullPath, encrypted);
    
    // Save metadata and decryption info
    await fs.writeFile(
      `${fullPath}.meta`,
      JSON.stringify({
        ...metadata,
        encryption: {
          algorithm: 'aes-256-gcm',
          key: key.toString('hex'),
          iv: iv.toString('hex'),
          authTag: authTag.toString('hex')
        }
      }, null, 2)
    );
    
    logger.warn('File quarantined:', {
      filename,
      quarantinePath: fullPath,
      threats: scanResults.threats
    });
    
    return fullPath;
    
  } catch (error) {
    logger.error('Failed to quarantine file:', error);
    throw error;
  }
}

/**
 * Check if file hash is in known malware database
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<Object>} Check results
 */
export async function checkMalwareDatabase(buffer) {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  
  try {
    // Check against local malware hash database
    // In production, this would query a real malware database
    const knownMalware = await getKnownMalwareHashes();
    
    if (knownMalware.has(hash)) {
      return {
        found: true,
        hash,
        threat: 'Known malware'
      };
    }
    
    // Check against online databases (optional)
    if (process.env.MALWARE_HASH_API_KEY) {
      const response = await fetch(
        `https://api.malwarehashregistry.com/v1/hash/${hash}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.MALWARE_HASH_API_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          found: data.found,
          hash,
          threat: data.threat || 'Unknown'
        };
      }
    }
    
    return {
      found: false,
      hash
    };
    
  } catch (error) {
    logger.error('Malware database check failed:', error);
    return {
      found: false,
      hash,
      error: error.message
    };
  }
}

/**
 * Get known malware hashes (mock implementation)
 * @returns {Promise<Set>} Set of malware hashes
 */
async function getKnownMalwareHashes() {
  // In production, this would load from a real database
  return new Set([
    // Example hashes (not real malware)
    'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  ]);
}

export default {
  scanFile,
  scanWithClamAV,
  scanWithWindowsDefender,
  scanWithVirusTotal,
  quarantineFile,
  checkMalwareDatabase
};
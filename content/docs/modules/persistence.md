# Persistence Module (Supabase)

## Overview

The Persistence Module integrates Supabase for storing scraped content and metadata. It provides cloud storage for HTML files, extracted text, and JSON metadata.

**Location**: `modules/persistence-supabase/`
**Module Entry**: [modules/persistence-supabase/module.ts](../../../modules/persistence-supabase/module.ts)

## Features

- ✅ **Supabase Storage integration**: Cloud file storage
- ✅ **Automatic persistence**: Stores scrape results automatically
- ✅ **Multiple file types**: HTML, text, and JSON metadata
- ✅ **Configurable bucket**: Custom storage bucket names
- ✅ **Server-side access**: Nitro plugin for server integration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Scraper Module                              │
│         (Scrapes content & extracts metadata)               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              Persistence Provider                            │
│     (Formats and uploads to Supabase Storage)               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                Supabase Storage                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     HTML     │  │     Text     │  │   Metadata   │      │
│  │    Folder    │  │    Folder    │  │    Folder    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Module Options

```typescript
interface SupabasePersistenceOptions {
  url?: string       // Supabase project URL
  key?: string       // Service role key (admin access)
  bucket?: string    // Storage bucket name (default: 'scraper')
}
```

### Environment Variables

Required environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=scraper
```

### nuxt.config.ts Integration

```typescript
export default defineNuxtConfig({
  modules: ['./modules/persistence-supabase'],
  runtimeConfig: {
    scraperPersistence: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_SERVICE_ROLE_KEY,
        bucket: process.env.SUPABASE_STORAGE_BUCKET || 'scraper'
      }
    }
  }
})
```

## Supabase Setup

### 1. Create Storage Bucket

In your Supabase dashboard:

1. Navigate to **Storage**
2. Click **New Bucket**
3. Name: `scraper` (or your custom name)
4. Visibility: **Private** (recommended for security)
5. Create bucket

### 2. Bucket Structure

The module organizes files in folders:

```
scraper/                    # Bucket root
├── html/                   # Raw HTML files
│   ├── {id}.html
│   ├── {id}.html
│   └── ...
├── text/                   # Extracted text
│   ├── {id}.txt
│   ├── {id}.txt
│   └── ...
└── metadata/               # Metadata JSON
    ├── {id}.json
    ├── {id}.json
    └── ...
```

### 3. Access Policies (Optional)

For public read access (if needed):

```sql
-- Allow public to read files (optional, use with caution)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'scraper');
```

For authenticated access only (recommended):

```sql
-- Only authenticated users can read
CREATE POLICY "Authenticated Read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'scraper'
  AND auth.role() = 'authenticated'
);
```

## Storage Provider

**Location**: `modules/persistence-supabase/runtime/server/provider.ts`

### Main Function: persistScrapeResult

```typescript
async function persistScrapeResult(
  result: ScrapeResult
): Promise<StoragePaths>
```

**Input**: Complete ScrapeResult object
**Output**:
```typescript
{
  htmlPath?: string    // Storage path for HTML
  textPath?: string    // Storage path for text
  metaPath?: string    // Storage path for metadata
}
```

### Storage Logic

1. **HTML Storage**:
   - Only if `result.content.html` exists
   - Path: `html/{result.id}.html`
   - Content-Type: `text/html`

2. **Text Storage**:
   - Always stored if text exists
   - Path: `text/{result.id}.txt`
   - Content-Type: `text/plain`

3. **Metadata Storage**:
   - Stores `result.metadata` as JSON
   - Path: `metadata/{result.id}.json`
   - Content-Type: `application/json`

### Upload Options

```typescript
{
  contentType: string,     // MIME type
  upsert: true,           // Overwrite if exists
  cacheControl: '3600'    // 1 hour cache
}
```

## Nitro Plugin Integration

**Location**: `modules/persistence-supabase/runtime/nitro-plugin.ts`

The module registers a Nitro plugin that:
1. Initializes Supabase client on server startup
2. Makes client available globally
3. Provides helper functions for storage operations

### Plugin API

```typescript
// Access in server routes
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.scraperPersistence.supabase.url
  const supabaseKey = config.scraperPersistence.supabase.key

  // Use Supabase client
  // ...
})
```

## Automatic Persistence

Scrape results are automatically persisted after scraping:

```typescript
// In scraper module
const result = await scrapeUrl(url)

// Automatically persist
if (result.status === 'ok') {
  const storagePaths = await persistScrapeResult(result)
  result.storage = storagePaths
}

return result
```

## Retrieving Stored Content

### Get File URL

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseKey)

// Get public URL (if bucket is public)
const { data } = supabase
  .storage
  .from('scraper')
  .getPublicUrl('html/abc123.html')

console.log(data.publicUrl)
```

### Download File

```typescript
// Download file contents
const { data, error } = await supabase
  .storage
  .from('scraper')
  .download('text/abc123.txt')

if (data) {
  const text = await data.text()
  console.log(text)
}
```

### Get Signed URL (Private Buckets)

```typescript
// Generate temporary signed URL (expires in 1 hour)
const { data, error } = await supabase
  .storage
  .from('scraper')
  .createSignedUrl('html/abc123.html', 3600)

console.log(data.signedUrl)  // Valid for 1 hour
```

## File Management

### List Files

```typescript
const { data, error } = await supabase
  .storage
  .from('scraper')
  .list('html', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  })

console.log(data)  // Array of files
```

### Delete Files

```typescript
// Delete single file
await supabase
  .storage
  .from('scraper')
  .remove(['html/abc123.html'])

// Delete multiple files
await supabase
  .storage
  .from('scraper')
  .remove([
    'html/abc123.html',
    'text/abc123.txt',
    'metadata/abc123.json'
  ])
```

### Move/Rename Files

```typescript
await supabase
  .storage
  .from('scraper')
  .move('html/old-name.html', 'html/new-name.html')
```

## Storage Quotas & Limits

### Supabase Free Tier
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File upload limit**: 50 MB per file

### Supabase Pro Tier
- **Storage**: 100 GB (expandable)
- **Bandwidth**: 200 GB/month (expandable)
- **File upload limit**: 5 GB per file

⚠️ **Monitor usage** to avoid hitting limits

## Error Handling

### Storage Errors

Common errors and handling:

```typescript
try {
  await persistScrapeResult(result)
} catch (error) {
  if (error.message.includes('Bucket not found')) {
    console.error('Storage bucket not configured')
  } else if (error.message.includes('unauthorized')) {
    console.error('Invalid Supabase credentials')
  } else if (error.message.includes('size limit')) {
    console.error('File too large for storage')
  } else {
    console.error('Storage error:', error)
  }
}
```

### Graceful Degradation

If Supabase is not configured:
- Scraping continues to work
- No storage paths in result
- Content still available in response
- Warning logged to console

## Security Considerations

### Service Role Key

⚠️ **Never expose service role key to client**

- Only use in server-side code
- Store in `.env` file
- Never commit to version control
- Rotate periodically

### Bucket Permissions

Recommended setup:
1. **Private bucket** by default
2. **Server-side access only** via service role
3. **Signed URLs** for temporary client access
4. **RLS policies** for fine-grained control

### Content Sanitization

Before storing HTML:
```typescript
// Consider sanitizing HTML to remove scripts
import DOMPurify from 'isomorphic-dompurify'

const cleanHtml = DOMPurify.sanitize(result.content.html)
```

## Performance Optimization

### Batch Uploads

For multiple files:
```typescript
// Upload in parallel
await Promise.all([
  uploadHtml(result),
  uploadText(result),
  uploadMetadata(result)
])
```

### Compression

```typescript
// Compress large text files
import zlib from 'zlib'

const compressed = zlib.gzipSync(text)
await supabase
  .storage
  .from('scraper')
  .upload('text/abc123.txt.gz', compressed, {
    contentType: 'application/gzip'
  })
```

### Caching

Use Supabase's cache-control:
```typescript
{
  cacheControl: '3600'  // Cache for 1 hour
}
```

## Known Limitations

⚠️ **Current Limitations**:

- **No retry logic**: Failed uploads not retried
- **No cleanup**: Old files not automatically deleted
- **No versioning**: Overwrite with upsert (no history)
- **No compression**: Large HTML files stored as-is
- **No database integration**: Only storage, no PostgreSQL usage yet
- **Sync operation**: Blocks until upload completes

## Future Enhancements

Planned improvements:

- [ ] Retry logic for failed uploads
- [ ] Automatic cleanup of old files
- [ ] File versioning system
- [ ] Compression for large files
- [ ] PostgreSQL integration for metadata
- [ ] Async upload with job queue
- [ ] Storage usage analytics
- [ ] CDN integration for faster delivery
- [ ] Multi-region storage support
- [ ] Automatic backups

## Alternative Providers (Future)

The module could be extended to support:

- **AWS S3**: More storage options
- **Google Cloud Storage**: GCP integration
- **Azure Blob Storage**: Microsoft cloud
- **Local filesystem**: Development/testing

Structure allows for multiple provider implementations.

## Troubleshooting

### "Bucket not found" Error

1. Verify bucket name in `.env` matches Supabase
2. Check bucket exists in Supabase dashboard
3. Verify service role key has access

### "Unauthorized" Error

1. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Verify key has `service_role` privileges
3. Check Supabase project URL is correct

### Upload Timeouts

1. Check file size (large HTML pages)
2. Verify network connectivity
3. Increase timeout in Supabase client config

### Files Not Appearing

1. Check bucket visibility settings
2. Verify upload succeeded (check response)
3. Check folder paths match expected structure

## Related Documentation

- [**Scraper Module**](scraper) - How content is scraped
- [**Architecture**](../architecture) - System overview
- [**Setup Guide**](../setup) - Initial configuration

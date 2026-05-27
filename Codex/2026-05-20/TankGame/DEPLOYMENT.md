# Hanzi Tank Deployment

This project is published as an Azure Storage static website.

## Current Production

- Site: `https://hanzitank05262136.z22.web.core.windows.net/`
- Resource group: `HanZiTank`
- Storage account: `hanzitank05262136`
- Static website container: `$web`

## Production Build

Always build before publishing:

```powershell
npm run build
```

The build writes `.deploy/site` and creates a hashed bundle such as `assets/app.9594139a7cb9.js`. The deploy package intentionally excludes readable source modules, tests, tools, and source-only assets:

- `src/`
- `tests/`
- `tools/`
- `assets/source/`

Do not upload the project root.

## Publish To Azure

Use a clean publish so stale files from older deployments do not remain publicly reachable.

```powershell
$ErrorActionPreference = "Stop"
$resourceGroup = "HanZiTank"
$storageAccount = "hanzitank05262136"
$accountKey = az storage account keys list --account-name $storageAccount --resource-group $resourceGroup --query '[0].value' -o tsv

az storage blob service-properties update `
  --account-name $storageAccount `
  --account-key $accountKey `
  --static-website true `
  --index-document index.html `
  --404-document index.html `
  -o none

az storage blob delete-batch `
  --account-name $storageAccount `
  --account-key $accountKey `
  --source '$web' `
  --only-show-errors `
  -o none

az storage blob upload-batch `
  --account-name $storageAccount `
  --account-key $accountKey `
  --destination '$web' `
  --source '.deploy/site' `
  --overwrite true `
  --only-show-errors `
  -o none
```

## Verify Production

After publishing, confirm the site loads, the production bundle is referenced, and old source paths are gone:

```powershell
$ErrorActionPreference = "Stop"
$base = "https://hanzitank05262136.z22.web.core.windows.net"
$index = Invoke-WebRequest -Uri "$base/" -UseBasicParsing
$oldSourceStatus = try { (Invoke-WebRequest -Uri "$base/src/core/combat-core.js" -UseBasicParsing).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }
$sourceAssetStatus = try { (Invoke-WebRequest -Uri "$base/assets/source/tank-dismantler-level5-boss-reference.png" -UseBasicParsing).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }

[pscustomobject]@{
  IndexStatus = $index.StatusCode
  HasProductionBundle = ($index.Content -match 'assets/app\.[a-f0-9]+\.js')
  HasOldSourceReference = ($index.Content -match 'src/core|src/data')
  OldSourceStatus = $oldSourceStatus
  SourceAssetStatus = $sourceAssetStatus
} | Format-List
```

Expected result:

- `IndexStatus`: `200`
- `HasProductionBundle`: `True`
- `HasOldSourceReference`: `False`
- `OldSourceStatus`: `404`
- `SourceAssetStatus`: `404`

Also open the production site in a browser and confirm the game starts and the footer build tag matches the intended `appVersion`.

## Last Verified Publish

- Date: 2026-05-26
- Build tag shown in game: `2026.05.26.08`
- Production bundle: `assets/app.9594139a7cb9.js`
- Blob count after clean publish: `488`
- Old source paths verified unavailable: `src/core/combat-core.js` and `assets/source/tank-dismantler-level5-boss-reference.png` returned `404`.

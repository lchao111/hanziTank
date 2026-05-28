# Hanzi Tank Deployment

This project can be published to GitHub Pages for a shorter public URL. Azure Storage remains available as a fallback static website host.

## Current Production

- Primary GitHub Pages URL: `https://lchao111.github.io/hanziTank/`
- Fallback Azure URL: `https://hanzitank05262136.z22.web.core.windows.net/`

## Azure Production

- Site: `https://hanzitank05262136.z22.web.core.windows.net/`
- Resource group: `HanZiTank`
- Storage account: `hanzitank05262136`
- Static website container: `$web`

## Production Build

Always build before publishing:

```powershell
npm run build
```

The build writes `.deploy/site` and creates a hashed bundle such as `assets/app.d31d9ce42e8d.js`. The deploy package intentionally excludes readable source modules, tests, tools, and source-only assets:

- `src/`
- `tests/`
- `tools/`
- `assets/source/`

Do not upload the project root.

## Publish To GitHub Pages

GitHub Pages deployment is handled by the repository-root workflow at `.github/workflows/hanzitank-pages.yml`. The repository root is `C:/Users/chlia/Documents`, and this game lives under `Codex/2026-05-20/TankGame`, so the workflow sets that folder as its working directory.

The workflow runs on pushes to `main` and `release/**`, and can also be started manually from the GitHub Actions tab. It performs:

1. `npm ci`
2. `npm test`
3. `npm run build`
4. Upload `.deploy/site` as the Pages artifact
5. Deploy through `actions/deploy-pages`

Expected public URL after the first successful Pages deployment:

```text
https://lchao111.github.io/hanziTank/
```

## Shared Leaderboard API

The game can show a cross-device leaderboard without moving full player saves to the cloud. The browser only calls a public leaderboard API URL; Cosmos DB credentials stay in Azure Functions application settings.

Current API:

```text
https://hanzitankapie34413bf.azurewebsites.net/api
```

Current Azure resources:

- Subscription: `Visual Studio Ultimate with MSDN`
- Tenant: `a13619cf-54d1-4cca-9213-d94847319fa4`
- Resource group: `rg-hanzi-tank-leaderboard`
- Cosmos account: `hanzitankcosmose34413bf`
- Cosmos database/container: `hanziTank` / `leaderboard`
- Function App: `hanzitankapie34413bf`
- Function storage: `hanzitanke34413bf`
- Region: `West US 3`

Frontend behavior:

- No API configured: War Archives shows local profiles only.
- API configured: War Archives merges local records with the shared top 20.
- Offline/API down: cached shared records plus local records are shown.

Server files live under `api/` and expose:

- `GET /api/leaderboard`
- `POST /api/leaderboard`

Required Azure Functions settings:

```text
COSMOS_CONNECTION_STRING=AccountEndpoint=...;AccountKey=...
COSMOS_DATABASE=hanziTank
COSMOS_LEADERBOARD_CONTAINER=leaderboard
ALLOWED_ORIGIN=https://lchao111.github.io,http://127.0.0.1:5173,http://localhost:5173
```

Do not put `COSMOS_CONNECTION_STRING`, AccountKey, or any Cosmos token in `index.html`, GitHub Pages secrets rendered into JS, or browser localStorage.

To create the leaderboard Azure resources in the personal tenant and deploy the API, run:

```powershell
powershell -ExecutionPolicy Bypass -File tools/provision-azure-leaderboard.ps1 -Login -ExpectedTenant "l.chaoneu"
```

The script creates/updates:

- Resource group `rg-hanzi-tank-leaderboard`
- Cosmos DB for NoSQL account with serverless capacity
- Database `hanziTank`
- Container `leaderboard`, partitioned by `/profileId`
- Storage account for Azure Functions runtime
- Node 24 Azure Function App
- Function app settings containing the Cosmos connection string
- Zip deployment for `api/`

The script prints the public API base URL when it finishes. It does not print the Cosmos connection string.

To build the static site with the public API URL embedded:

```powershell
$env:HANZI_TANK_LEADERBOARD_API = "https://YOUR-FUNCTION-APP.azurewebsites.net/api"
npm run build
```

For local testing without rebuilding, set the public API URL in the browser console:

```js
localStorage.setItem("hanziTankLeaderboardApi", "http://localhost:7071/api");
location.reload();
```

If GitHub Pages has not been enabled for the repository yet, set the repository Pages source to **GitHub Actions** in GitHub settings, or use `gh`/GitHub API to enable Pages build type `workflow`.

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
- Build tag shown in game: `2026.05.26.09`
- Production bundle: `assets/app.d31d9ce42e8d.js`
- Blob count after clean publish: `501`
- Old source paths verified unavailable: `src/core/combat-core.js` and `assets/source/tank-dismantler-level5-boss-reference.png` returned `404`.
- Phaser runtime is served locally from `assets/vendor/phaser.min.js`; production no longer depends on the CDN script.

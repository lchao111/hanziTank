param(
  [string]$ExpectedTenant = "l.chaoneu",
  [string]$SubscriptionId = "",
  [string]$ResourceGroup = "rg-hanzi-tank-leaderboard",
  [string]$Location = "eastus",
  [string]$NamePrefix = "hanzitank",
  [string]$AllowedOrigin = "https://lchao111.github.io,http://127.0.0.1:5173,http://localhost:5173",
  [switch]$Login
)

$ErrorActionPreference = "Stop"

function Invoke-AzJson {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)
  $output = & az @Arguments -o json 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw ($output | Out-String)
  }
  if (-not $output) { return $null }
  return ($output | Out-String | ConvertFrom-Json)
}

function Invoke-AzNone {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)
  $output = & az @Arguments -o none 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw ($output | Out-String)
  }
}

function Get-SafeNamePart {
  param([string]$Value, [int]$Length)
  $safe = ($Value.ToLowerInvariant() -replace '[^a-z0-9]', '')
  if ($safe.Length -gt $Length) { return $safe.Substring(0, $Length) }
  return $safe
}

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  throw "Azure CLI is required. Install it, then run this script again."
}

if ($Login) {
  & az login --tenant $ExpectedTenant -o none
  if ($LASTEXITCODE -ne 0) { throw "Azure login failed for tenant $ExpectedTenant." }
}

if ($SubscriptionId) {
  Invoke-AzNone @("account", "set", "--subscription", $SubscriptionId)
}

$account = Invoke-AzJson @("account", "show", "--query", "{name:name,id:id,tenantId:tenantId,user:user.name}")
$tenantText = "$($account.tenantId) $($account.name) $($account.user)"
$expectedTenantIsGuid = $ExpectedTenant -match '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
if ($ExpectedTenant -and $expectedTenantIsGuid -and ($account.tenantId -ne $ExpectedTenant)) {
  throw "Refusing to create resources. Current tenant $($account.tenantId) does not match expected tenant $ExpectedTenant."
}
if ($ExpectedTenant -and -not $expectedTenantIsGuid -and -not $Login -and ($tenantText -notmatch [regex]::Escape($ExpectedTenant))) {
  throw "Refusing to create resources. Current Azure account does not look like '$ExpectedTenant'. Current account: $($account.name), tenant: $($account.tenantId), user: $($account.user). Run: az login --tenant $ExpectedTenant"
}

$suffixSource = "$($account.id)-$ResourceGroup-$Location"
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$suffixBytes = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($suffixSource))
$sha256.Dispose()
$suffix = -join ($suffixBytes[0..3] | ForEach-Object { $_.ToString("x2") })
$prefix = Get-SafeNamePart $NamePrefix 12
$storageAccount = Get-SafeNamePart "$prefix$suffix" 24
$cosmosAccount = Get-SafeNamePart "$prefix-cosmos-$suffix" 44
$functionApp = Get-SafeNamePart "$prefix-api-$suffix" 60

Write-Host "Using subscription: $($account.name)"
Write-Host "Resource group: $ResourceGroup"
Write-Host "Location: $Location"
Write-Host "Cosmos account: $cosmosAccount"
Write-Host "Function app: $functionApp"
Write-Host "Storage account: $storageAccount"

$resourceGroupExists = $true
try {
  Invoke-AzJson @("group", "show", "--name", $ResourceGroup) | Out-Null
} catch {
  $resourceGroupExists = $false
}
if (-not $resourceGroupExists) {
  Invoke-AzJson @("group", "create", "--name", $ResourceGroup, "--location", $Location) | Out-Null
}

$cosmosExists = $true
try {
  Invoke-AzJson @("cosmosdb", "show", "--name", $cosmosAccount, "--resource-group", $ResourceGroup) | Out-Null
} catch {
  $cosmosExists = $false
}
if (-not $cosmosExists) {
  Invoke-AzJson @(
    "cosmosdb", "create",
    "--name", $cosmosAccount,
    "--resource-group", $ResourceGroup,
    "--locations", "regionName=$Location", "failoverPriority=0", "isZoneRedundant=False",
    "--capabilities", "EnableServerless",
    "--default-consistency-level", "Session"
  ) | Out-Null
}

Invoke-AzJson @("cosmosdb", "sql", "database", "create", "--account-name", $cosmosAccount, "--resource-group", $ResourceGroup, "--name", "hanziTank") | Out-Null
Invoke-AzJson @(
  "cosmosdb", "sql", "container", "create",
  "--account-name", $cosmosAccount,
  "--resource-group", $ResourceGroup,
  "--database-name", "hanziTank",
  "--name", "leaderboard",
  "--partition-key-path", "/profileId"
) | Out-Null

Invoke-AzJson @(
  "storage", "account", "create",
  "--name", $storageAccount,
  "--resource-group", $ResourceGroup,
  "--location", $Location,
  "--sku", "Standard_LRS",
  "--kind", "StorageV2",
  "--min-tls-version", "TLS1_2",
  "--allow-blob-public-access", "false"
) | Out-Null

$functionExists = $true
try {
  Invoke-AzJson @("functionapp", "show", "--name", $functionApp, "--resource-group", $ResourceGroup) | Out-Null
} catch {
  $functionExists = $false
}
if (-not $functionExists) {
  Invoke-AzJson @(
    "functionapp", "create",
    "--name", $functionApp,
    "--resource-group", $ResourceGroup,
    "--storage-account", $storageAccount,
    "--consumption-plan-location", $Location,
    "--runtime", "node",
    "--runtime-version", "24",
    "--functions-version", "4",
    "--os-type", "Windows"
  ) | Out-Null
}

$connectionString = & az cosmosdb keys list --name $cosmosAccount --resource-group $ResourceGroup --type connection-strings --query "connectionStrings[0].connectionString" -o tsv
if ($LASTEXITCODE -ne 0 -or -not $connectionString) { throw "Could not read Cosmos DB connection string." }

Invoke-AzNone @(
  "functionapp", "config", "appsettings", "set",
  "--name", $functionApp,
  "--resource-group", $ResourceGroup,
  "--settings",
  "COSMOS_CONNECTION_STRING=$connectionString",
  "COSMOS_DATABASE=hanziTank",
  "COSMOS_LEADERBOARD_CONTAINER=leaderboard",
  "ALLOWED_ORIGIN=$AllowedOrigin"
)

Push-Location (Join-Path $PSScriptRoot "..\api")
try {
  npm install
  New-Item -ItemType Directory -Path ..\.deploy -Force | Out-Null
  Compress-Archive -Path * -DestinationPath ..\.deploy\leaderboard-api.zip -Force
  & az functionapp deployment source config-zip --name $functionApp --resource-group $ResourceGroup --src ..\.deploy\leaderboard-api.zip -o none
  if ($LASTEXITCODE -ne 0) { throw "Function zip deployment failed." }
} finally {
  Pop-Location
}

$apiBase = "https://$functionApp.azurewebsites.net/api"
Write-Host "Leaderboard API: $apiBase"
Write-Host "Build frontend with: `$env:HANZI_TANK_LEADERBOARD_API = '$apiBase'; npm run build"
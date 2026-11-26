param(
  [string]$EnvFile = ".env.local",
  [string]$SiteUrl = "",
  [switch]$IncludeContactTests
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Host "FAIL: Env file not found: $EnvFile"
  exit 1
}

$envMap = @{}
foreach ($rawLine in (Get-Content -LiteralPath $EnvFile)) {
  $line = $rawLine.Trim()
  if (-not $line -or $line.StartsWith("#")) { continue }
  $eqIndex = $line.IndexOf("=")
  if ($eqIndex -le 0) { continue }
  $k = $line.Substring(0, $eqIndex).Trim()
  $v = $line.Substring($eqIndex + 1).Trim()
  if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
    $v = $v.Substring(1, $v.Length - 2)
  }
  $envMap[$k] = $v
}

$supabaseUrl = if ($envMap.ContainsKey("VITE_SUPABASE_URL")) { $envMap["VITE_SUPABASE_URL"].TrimEnd("/") } else { "" }
$anonKey = if ($envMap.ContainsKey("VITE_SUPABASE_ANON_KEY")) { $envMap["VITE_SUPABASE_ANON_KEY"] } else { "" }

if (-not $supabaseUrl -or -not $anonKey) {
  Write-Host "FAIL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in $EnvFile"
  exit 1
}

$script:failures = 0

function Record-Result {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Detail
  )
  if ($Passed) {
    Write-Host "PASS: $Name ($Detail)"
  } else {
    Write-Host "FAIL: $Name ($Detail)"
    $script:failures++
  }
}

function Record-WriteRefusal {
  param(
    [string]$Name,
    [string]$Status
  )
  if ($Status -eq "401" -or $Status -eq "403") {
    Record-Result -Name $Name -Passed $true -Detail "HTTP $Status - permission denied"
  } elseif ($Status -eq "204" -or $Status -eq "200" -or $Status -eq "201") {
    Record-Result -Name $Name -Passed $false -Detail "HTTP $Status - anon holds write privilege; RLS probably blocked it; run supabase/06_lock_anon_writes.sql"
  } else {
    Record-Result -Name $Name -Passed $false -Detail "HTTP $Status - expected 401 or 403"
  }
}

function Invoke-CurlRequest {
  param(
    [string]$Method,
    [string]$Url,
    [string[]]$ExtraHeaders = @(),
    [string]$Body = ""
  )
  $tmpOut = [System.IO.Path]::GetTempFileName()
  $tmpBody = $null
  try {
    $args = @("-sS", "-o", $tmpOut, "-w", "%{http_code}", "-X", $Method, $Url, "-H", "apikey: $anonKey")
    foreach ($h in $ExtraHeaders) {
      $args += "-H"
      $args += $h
    }
    if ($Body -ne "") {
      $tmpBody = [System.IO.Path]::GetTempFileName()
      $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
      [System.IO.File]::WriteAllText($tmpBody, $Body, $utf8NoBom)
      $args += "--data-binary"
      $args += "@$tmpBody"
    }
    $status = & curl.exe @args
    $text = if (Test-Path -LiteralPath $tmpOut) { Get-Content -LiteralPath $tmpOut -Raw } else { "" }
    return @{ Status = [string]$status; Body = [string]$text }
  } finally {
    if (Test-Path -LiteralPath $tmpOut) {
      Remove-Item -LiteralPath $tmpOut -Force -ErrorAction SilentlyContinue
    }
    if ($null -ne $tmpBody -and (Test-Path -LiteralPath $tmpBody)) {
      Remove-Item -LiteralPath $tmpBody -Force -ErrorAction SilentlyContinue
    }
  }
}

# 1. get_site_content RPC works and returns expected keys
$rpc = Invoke-CurlRequest -Method "POST" -Url "$supabaseUrl/rest/v1/rpc/get_site_content" -ExtraHeaders @("Content-Type: application/json", "Accept: application/json") -Body "{}"
$rpcOk = $false
if ($rpc.Status -eq "200") {
  try {
    $json = $rpc.Body | ConvertFrom-Json
    $requiredKeys = @("version", "settings", "profile", "sections", "projects", "education", "certifications")
    $missing = @()
    foreach ($rk in $requiredKeys) {
      if ($null -eq $json.PSObject.Properties[$rk]) {
        $missing += $rk
      }
    }
    $rpcOk = ($missing.Count -eq 0)
  } catch {
    $rpcOk = $false
  }
}
Record-Result -Name "RPC get_site_content returns expected keys" -Passed $rpcOk -Detail "HTTP $($rpc.Status)"

# 2. Reading profile, messages, and admins directly: 401/403, or 200 with exact []
foreach ($table in @("profile", "messages", "admins")) {
  $res = Invoke-CurlRequest -Method "GET" -Url "$supabaseUrl/rest/v1/$table`?select=*" -ExtraHeaders @("Accept: application/json")
  $trimmed = $res.Body.Trim()
  $deniedOrEmpty = ($res.Status -eq "401" -or $res.Status -eq "403" -or ($res.Status -eq "200" -and $trimmed -eq "[]"))
  Record-Result -Name "Direct read on $table blocked or empty" -Passed $deniedOrEmpty -Detail "HTTP $($res.Status)"
}

# 3. Insert / update / delete on projects and insert into admins refused with 401/403
$projInsert = Invoke-CurlRequest -Method "POST" -Url "$supabaseUrl/rest/v1/projects" -ExtraHeaders @("Content-Type: application/json", "Prefer: return=minimal") -Body '{"title":"SMOKE TEST"}'
Record-WriteRefusal -Name "Insert into projects refused" -Status $projInsert.Status

$projUpdate = Invoke-CurlRequest -Method "PATCH" -Url "$supabaseUrl/rest/v1/projects?id=eq.00000000-0000-0000-0000-000000000000" -ExtraHeaders @("Content-Type: application/json", "Prefer: return=minimal") -Body '{"title":"SMOKE TEST"}'
Record-WriteRefusal -Name "Update on projects refused" -Status $projUpdate.Status

$projDelete = Invoke-CurlRequest -Method "DELETE" -Url "$supabaseUrl/rest/v1/projects?id=eq.00000000-0000-0000-0000-000000000000" -ExtraHeaders @("Prefer: return=minimal")
Record-WriteRefusal -Name "Delete on projects refused" -Status $projDelete.Status

$adminInsert = Invoke-CurlRequest -Method "POST" -Url "$supabaseUrl/rest/v1/admins" -ExtraHeaders @("Content-Type: application/json", "Prefer: return=minimal") -Body '{"user_id":"00000000-0000-0000-0000-000000000000"}'
Record-WriteRefusal -Name "Insert into admins refused" -Status $adminInsert.Status

# 4. Storage upload to real buckets (portfolio, project-documents): PASS on 401/403 or body statusCode 403 / RLS / Unauthorized
foreach ($bucket in @("portfolio", "project-documents")) {
  $uploadRes = Invoke-CurlRequest -Method "POST" -Url "$supabaseUrl/storage/v1/object/$bucket/smoke-test.txt" -ExtraHeaders @("Content-Type: text/plain") -Body "smoke-test"
  $bodyStatusCode = ""
  $bodyMessage = ""
  if ($uploadRes.Body) {
    try {
      $bodyJson = $uploadRes.Body | ConvertFrom-Json
      if ($null -ne $bodyJson) {
        if ($null -ne $bodyJson.PSObject.Properties["statusCode"]) {
          $bodyStatusCode = [string]$bodyJson.statusCode
        }
        if ($null -ne $bodyJson.PSObject.Properties["message"]) {
          $bodyMessage = [string]$bodyJson.message
        }
      }
    } catch {
      # Non-JSON response body; fall back to HTTP status and raw body checks
    }
  }

  $isUploadSuccess = ($uploadRes.Status -eq "200" -or $uploadRes.Status -eq "201")
  $isBucketMissing = ($bodyStatusCode -eq "404" -or $bodyMessage -match "Bucket not found" -or $uploadRes.Body -match "Bucket not found")
  $isRefused = (
    $uploadRes.Status -eq "401" -or
    $uploadRes.Status -eq "403" -or
    $bodyStatusCode -eq "403" -or
    $bodyMessage -match "row-level security" -or
    $bodyMessage -match "Unauthorized" -or
    $uploadRes.Body -match "row-level security" -or
    $uploadRes.Body -match "Unauthorized"
  )

  if ($isUploadSuccess) {
    Record-Result -Name "Storage upload to $bucket refused" -Passed $false -Detail "HTTP $($uploadRes.Status) - upload succeeded"
  } elseif ($isBucketMissing) {
    Record-Result -Name "Storage upload to $bucket refused" -Passed $false -Detail "HTTP $($uploadRes.Status) - bucket not found"
  } elseif ($isRefused) {
    $detail = if ($bodyStatusCode) { "HTTP $($uploadRes.Status), body statusCode $bodyStatusCode" } else { "HTTP $($uploadRes.Status)" }
    Record-Result -Name "Storage upload to $bucket refused" -Passed $true -Detail $detail
  } else {
    Record-Result -Name "Storage upload to $bucket refused" -Passed $false -Detail "HTTP $($uploadRes.Status) - expected 401, 403, or RLS refusal"
  }
}

# 5. Optional contact form tests (only when -IncludeContactTests is specified)
if ($IncludeContactTests) {
  $validMsg = Invoke-CurlRequest -Method "POST" -Url "$supabaseUrl/rest/v1/messages" -ExtraHeaders @("Content-Type: application/json", "Prefer: return=minimal") -Body '{"name":"SMOKE TEST","email":"smoke-test@invalid.example","subject":"SMOKE TEST","body":"Automated smoke test message - safe to delete."}'
  $msgAccepted = ($validMsg.Status -eq "201" -or $validMsg.Status -eq "200" -or $validMsg.Status -eq "204")
  Record-Result -Name "Valid contact message accepted" -Passed $msgAccepted -Detail "HTTP $($validMsg.Status)"

  $invalidMsg = Invoke-CurlRequest -Method "POST" -Url "$supabaseUrl/rest/v1/messages" -ExtraHeaders @("Content-Type: application/json", "Prefer: return=minimal") -Body '{"name":"SMOKE TEST","email":"not-an-email","subject":"SMOKE TEST","body":"Should fail email validation."}'
  if ($invalidMsg.Status -eq "400" -or $invalidMsg.Status -eq "422") {
    Record-Result -Name "Invalid contact email refused" -Passed $true -Detail "HTTP $($invalidMsg.Status)"
  } elseif ($invalidMsg.Status -eq "201") {
    Record-Result -Name "Invalid contact email refused" -Passed $false -Detail "HTTP 201 - supabase/04_hardening.sql was not applied"
  } else {
    Record-Result -Name "Invalid contact email refused" -Passed $false -Detail "HTTP $($invalidMsg.Status) - expected 400 or 422"
  }
}

# 6. Optional deployed SiteUrl security header checks
if ($SiteUrl -ne "") {
  $rawHeaders = & curl.exe -sSIL $SiteUrl
  $headerText = ($rawHeaders -join "`n")
  foreach ($hdr in @("Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Strict-Transport-Security")) {
    $present = $headerText -match "(?im)^$([regex]::Escape($hdr))\s*:"
    Record-Result -Name "Response header $hdr present" -Passed $present -Detail $SiteUrl
  }
}

if ($script:failures -gt 0) {
  exit 1
}

exit 0

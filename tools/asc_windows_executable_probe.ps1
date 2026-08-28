param([Parameter(Mandatory=$true)][string]$InstallerUrl,[string]$OutFile="$env:RUNNER_TEMP\asc-probe.json")
$ErrorActionPreference='Stop'
$tmp=Join-Path $env:RUNNER_TEMP 'asc-probe'
New-Item -ItemType Directory -Force $tmp|Out-Null
$installer=Join-Path $tmp 'aScTimeTables.exe'
Invoke-WebRequest -UseBasicParsing $InstallerUrl -OutFile $installer
$patterns=@('command line','--generate','/generate','-generate','--help','/help','automation','xml','\.roz')
function Surface([string]$p){$bytes=[IO.File]::ReadAllBytes($p);$text=[Text.Encoding]::ASCII.GetString($bytes);$h=@{};foreach($x in $patterns){$h[$x]=[Math]::Min(([regex]::Matches($text,$x,[Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count,999)};return $h}
function SafeLaunch([string]$exe,[string]$arg){$o=[ordered]@{arg=$arg;started=$false;exited=$null;exit_code=$null;window_title=$null;error=$null};try{$p=Start-Process -FilePath $exe -ArgumentList $arg -PassThru -WindowStyle Hidden;$o.started=$true;Start-Sleep -Seconds 3;$p.Refresh();$o.window_title=$p.MainWindowTitle;if($p.HasExited){$o.exited=$true;$o.exit_code=$p.ExitCode}else{$o.exited=$false;Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue}}catch{$o.error=$_.Exception.Message};return $o}
$hash=(Get-FileHash $installer -Algorithm SHA256).Hash.ToLowerInvariant();$sig=Get-AuthenticodeSignature $installer;$fv=[Diagnostics.FileVersionInfo]::GetVersionInfo($installer);$installerHits=Surface $installer
$seven=(Get-Command 7z.exe -ErrorAction SilentlyContinue);$files=@();$exeMeta=@();$launch=@()
if($seven){
 $extract=Join-Path $tmp 'extract';New-Item -ItemType Directory -Force $extract|Out-Null;& $seven.Source x '-y' "-o$extract" $installer *> (Join-Path $tmp '7z-extract.log')
 $files=Get-ChildItem $extract -Recurse -File|ForEach-Object{$_.FullName.Substring($extract.Length+1)}
 foreach($e in Get-ChildItem $extract -Recurse -File -Filter *.exe){
  $v=[Diagnostics.FileVersionInfo]::GetVersionInfo($e.FullName);$s=Get-AuthenticodeSignature $e.FullName
  $exeMeta+=@{path=$e.FullName.Substring($extract.Length+1);sha256=(Get-FileHash $e.FullName -Algorithm SHA256).Hash.ToLowerInvariant();size_bytes=$e.Length;file_version=$v.FileVersion;product_version=$v.ProductVersion;product_name=$v.ProductName;signature_status=[string]$s.Status;signer=if($s.SignerCertificate){$s.SignerCertificate.Subject}else{$null};ascii_surface_hits=Surface $e.FullName}
  if($e.Name -ieq 'roz.exe'){$launch+=SafeLaunch $e.FullName '--help';$launch+=SafeLaunch $e.FullName '/?'}
 }
}
$r=[ordered]@{schema='OKULOS_ASC_EXECUTABLE_PROBE_V2';status='PROBED_NOT_GENERATED';download_url=$InstallerUrl;sha256=$hash;size_bytes=(Get-Item $installer).Length;installer=@{file_version=$fv.FileVersion;product_version=$fv.ProductVersion;product_name=$fv.ProductName;company_name=$fv.CompanyName;signature_status=[string]$sig.Status;signer=if($sig.SignerCertificate){$sig.SignerCertificate.Subject}else{$null};ascii_surface_hits=$installerHits};extracted_file_count=$files.Count;extracted_executables=$exeMeta;safe_launch_probes=$launch;generation_status='NOT_RUN';claim='Probe evidence only. Safe help switches only; no generation, objective parity, or performance claim.';runner=@{os=[Environment]::OSVersion.VersionString;processor=$env:PROCESSOR_IDENTIFIER}}
$r|ConvertTo-Json -Depth 10|Set-Content -Encoding utf8 $OutFile
Get-Content $OutFile
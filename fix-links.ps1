$files = @(
  "charge-decode/pages/adobe-cc.html",
  "charge-decode/pages/amzn-mktp.html",
  "charge-decode/pages/apl-itunes-com-bill.html",
  "charge-decode/pages/aplprinces.html",
  "charge-decode/pages/bill-com.html",
  "charge-decode/pages/canva.html",
  "charge-decode/pages/dramabox.html",
  "charge-decode/pages/dri-avast.html",
  "charge-decode/pages/dri-pandasecurity.html",
  "charge-decode/pages/dri.html",
  "charge-decode/pages/foreign-transaction-fee.html",
  "charge-decode/pages/fundstreet.html",
  "charge-decode/pages/godaddy.html",
  "charge-decode/pages/google-temp-hold.html",
  "charge-decode/pages/help-max-com.html",
  "charge-decode/pages/hulu.html",
  "charge-decode/pages/intuit-qb.html",
  "charge-decode/pages/join-ventures-pte-ltd.html",
  "charge-decode/pages/linkedin-premium.html",
  "charge-decode/pages/livepay1-com.html",
  "charge-decode/pages/microsoft365.html",
  "charge-decode/pages/msft-charge.html",
  "charge-decode/pages/msft-xbox-game-pass.html",
  "charge-decode/pages/nytimes.html",
  "charge-decode/pages/paddle-net-paddle-com.html",
  "charge-decode/pages/paypal-netflix.html",
  "charge-decode/pages/pos-debit.html",
  "charge-decode/pages/pypl.html",
  "charge-decode/pages/shutterstock.html",
  "charge-decode/pages/spotify-usa.html",
  "charge-decode/pages/sq-charge.html",
  "charge-decode/pages/uber-trip.html",
  "charge-decode/pages/wp-wordpress-woocommerce.html",
  "charge-decode/pages/youtube-premium.html",
  "charge-decode/pages/zoom-us.html"
)

$names = @(
  "adobe-cc","amzn-mktp","apl-itunes-com-bill","aplprinces","bill-com","canva",
  "dramabox","dri-avast","dri-pandasecurity","dri","foreign-transaction-fee",
  "fundstreet","godaddy","google-temp-hold","help-max-com","hulu","intuit-qb",
  "join-ventures-pte-ltd","linkedin-premium","livepay1-com","microsoft365",
  "msft-charge","msft-xbox-game-pass","nytimes","paddle-net-paddle-com",
  "paypal-netflix","pos-debit","pypl","shutterstock","spotify-usa","sq-charge",
  "uber-trip","wp-wordpress-woocommerce","youtube-premium","zoom-us"
)

for ($i = 0; $i -lt $files.Count; $i++) {
  $f = $files[$i]
  if (-not (Test-Path $f)) { Write-Output "SKIP: $f"; continue }
  $n = $names[$i]
  $content = Get-Content $f -Raw -Encoding UTF8
  $before = $content.Length

  # 1) Replace relative links: href="xxx.html" -> href="/charge-decode/pages/xxx"
  $content = [regex]::Replace($content, 'href="' + $n + '\.html"', 'href="/charge-decode/pages/' + $n + '"')

  # 2) Replace canonical absolute URLs with .html suffix -> without
  $content = [regex]::Replace($content, 'https://glq-api\.asia/charge-decode/pages/' + $n + '\.html', 'https://glq-api.asia/charge-decode/pages/' + $n)

  # 3) Ensure URL ends with quote
  $content = [regex]::Replace($content, '(href="/charge-decode/pages/' + $n + ')(?=["\s])', '$1"')

  if ($content.Length -ne $before) {
    Set-Content -Path $f -Value $content -Encoding UTF8 -NoNewline
    Write-Output "FIXED: $f"
  } else {
    Write-Output "OK: $f"
  }
}
Write-Output "DONE"

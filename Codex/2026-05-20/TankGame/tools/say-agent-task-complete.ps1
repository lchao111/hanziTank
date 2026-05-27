[CmdletBinding()]
param(
  [string]$Message = '任务完成'
)

$ErrorActionPreference = 'Stop'

try {
  Add-Type -AssemblyName System.Speech
  $speaker = [System.Speech.Synthesis.SpeechSynthesizer]::new()
  $speaker.Volume = 100
  $speaker.Rate = 0

  $chineseVoice = $speaker.GetInstalledVoices() |
    Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'zh-*' } |
    Select-Object -First 1

  if ($chineseVoice) {
    $speaker.SelectVoice($chineseVoice.VoiceInfo.Name)
  }

  $speaker.Speak($Message)
  $speaker.Dispose()
} catch {
  Write-Warning "Could not play completion TTS: $($_.Exception.Message)"
}
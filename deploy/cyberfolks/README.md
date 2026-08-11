# Timzy on CyberFolks

The upload-ready website is assembled into `release/cyberfolks-public_html` by
`scripts/build_cyberfolks_release.py` after the prerender build.

The contact form reads its private SMTP and CAPTCHA settings from
`public_html/.private/timzy-contact-config.php`. The directory is denied at the
HTTP server level and directory listing is disabled. The real config is
installed directly on the hosting account and is intentionally excluded from
source control and downloadable release archives.

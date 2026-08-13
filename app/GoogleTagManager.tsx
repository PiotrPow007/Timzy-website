export const GTM_ID = "GTM-MVQN5NX8";
export const CONSENT_KEY = "timzy-cookie-consent-v2";

const tagManagerScript = `(function(w,d,s,l,i){w[l]=w[l]||[];
function gtag(){w[l].push(arguments);}
w.gtag=w.gtag||gtag;
w.gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});
try {
  if (w.localStorage.getItem('${CONSENT_KEY}') === 'accepted') {
    w.gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }
} catch (error) {
  // Storage may be unavailable. The denied defaults remain in force.
}
w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

export function GoogleTagManagerHead() {
  return <script id="google-tag-manager" dangerouslySetInnerHTML={{ __html: tagManagerScript }} />;
}

export function GoogleTagManagerNoScript() {
  return <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe>` }} />;
}

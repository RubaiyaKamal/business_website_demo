import Script from "next/script";
import { env } from "@/lib/env";

/**
 * Google Analytics 4 loader. Renders nothing unless
 * NEXT_PUBLIC_GOOGLE_ANALYTICS_ID is configured.
 */
export function GoogleAnalytics() {
  const id = env.googleAnalyticsId;
  if (!id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "${id}");`}
      </Script>
    </>
  );
}

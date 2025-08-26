import * as Constants from 'config/constants'

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import HighchartsProvider from 'components/providers/HighchartsProvider';
import DanfoProvider from 'components/providers/DanfoProvider';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import MuiProviders from './MuiProviders';
import Script from 'next/script'
import { Metadata } from 'next'
import { Roboto } from 'next/font/google'

import '../styles/globals.scss';

export const metadata: Metadata = {
  title: Constants.APP_TITLE,
  description: `Transcriptions of ${Object.entries(Constants.CATEGORY_CHANNEL_MAP).map(([k,info]) => info.name).join(', ')}`,
};

const roboto = Roboto({subsets: ['latin'],});

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <body>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${Constants.GA_MEASUREMENT_ID}`} />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
        <MuiProviders>
          <HighchartsProvider>
            <DanfoProvider>
              <CssBaseline />
              <InitColorSchemeScript attribute="class"/>
              <Box sx={{
                marginTop: "0.5ex",
                height: "100%",
                maxWidth: "120ch",
                marginX: 'auto',
                }}>
                {children}
              </Box>
            </DanfoProvider>
          </HighchartsProvider>
        </MuiProviders>
      </body>
    </html>
  )
}

import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import React from 'react';
import theme from '../theme';
import Head from 'next/head';
import { trpcNext } from "../trpc";
import { NextPageWithLayout } from "../NextPageWithLayout";
import { ToastContainer } from "react-toastify";
import { SessionProvider } from "next-auth/react";

import '../app.css';
import 'horizon-ui/styles/Fonts.css';
import 'react-toastify/dist/ReactToastify.min.css';

function App({ Component, pageProps: { session, ...pageProps } }: {
  Component: NextPageWithLayout,
} & AppProps) {
  const getLayout = Component.getLayout || (page => page);

  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title></title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#000000' />
      </Head>

      <SessionProvider session={session}>
        {getLayout(<Component {...pageProps} />)}
      </SessionProvider>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ChakraProvider>
  );
}

export default trpcNext.withTRPC(App);

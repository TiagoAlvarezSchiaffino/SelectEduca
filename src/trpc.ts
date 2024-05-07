import { TRPCClientError, TRPCLink, createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { ApiRouter } from './api/apiRouter';
import { observable } from '@trpc/server/observable';
import { toast } from "react-toastify";
import { createTRPCNext } from "@trpc/next";

function getBaseUrl() {
  // browser should use relative path
  if (typeof window !== 'undefined') return '';
  // vercel.com
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // render.com
  if (process.env.RENDER_INTERNAL_HOSTNAME) return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // fall back to localhost    
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

const errorToastLink: TRPCLink<ApiRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err: TRPCClientError<ApiRouter>) {
          console.log('TRPC got an error:', err);
          if (err.data?.code !== "CONFLICT") {
            toast.error(`Oops！${err.message}`);
          }
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};

export const links = [
  errorToastLink,
  ...(process.env.NODE_ENV === "production" ? [] : [loggerLink()]),
  httpBatchLink({
    url: getBaseUrl() + '/api/v1',
    headers: () => {
      return {
        Authorization: `Bearer ${localStorage.getItem('_authing_token')}`,
      };
    },
    maxURLLength: 2083,
  }),
];

const trpc = createTRPCProxyClient<ApiRouter>({ links });

export default trpc;

export const trpcNext = createTRPCNext<ApiRouter>({
  config({ ctx }) {
    return {
      links,
    };
  },
  ssr: false,
});
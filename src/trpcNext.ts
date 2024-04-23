import type { ApiRouter } from './api/apiRouter';
import { createTRPCNext } from "@trpc/next";
import { links } from './trpc';

const trpcNext = createTRPCNext<ApiRouter>({
    config({ ctx }) {
      return {
        links,
      };
    },
    ssr: false,
});

export default trpcNext;
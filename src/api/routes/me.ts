import { procedure, router } from "../trpc";
import { z } from "zod";
import { authUser, invalidateLocalUserCache } from "../auth";
import IUser from "../../shared/IUser";
import pinyin from 'tiny-pinyin';

const me = router({
  profile: procedure.use(
    authUser('me:read')
  ).query(async ({ ctx }) => {
    return ctx.user as IUser;
  }),

  updateProfile: procedure.use(
    authUser('me:write')
  ).input(
    z.object( { name: z.string().min(2, "required") })

  ).mutation(async ({ input, ctx }) => {
    await ctx.user.update({
      name: input.name,

      pinyin: pinyin.convertToPinyin(input.name),
    });
    invalidateLocalUserCache();
  })
});

export default me;

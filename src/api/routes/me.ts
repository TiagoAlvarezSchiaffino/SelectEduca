import { procedure, router } from "../trpc";
import { authUser, invalidateLocalUserCache } from "../auth";
import IUser from "../../shared/IUser";
import pinyin from 'tiny-pinyin';
import { zUserProfile } from "shared/UserProfile";
import { TRPCError } from "@trpc/server";

const me = router({
  profile: procedure
  .use(authUser())
  .output(zUserProfile)
  .query(async ({ ctx }) => ctx.user),
  updateProfile: procedure
  .use(authUser())
  .input(zUserProfile)
  .mutation(async ({ input, ctx }) => {
    if (!input.name || input.name.length < 2) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid user name'
      })
    }
    await ctx.user.update({
      name: input.name,
      pinyin: pinyin.convertToPinyin(input.name),
      consentFormAcceptedAt: input.consentFormAcceptedAt,
    });
    invalidateLocalUserCache();
  })
});
export default me;
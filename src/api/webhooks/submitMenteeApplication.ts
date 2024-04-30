import { procedure } from "../trpc";
import z from "zod";
import { generalBadRequestError } from "../errors";
import { createUser } from "../database/models/User";

export default procedure
  .input(z.record(z.string()))
  .mutation(async ({ input }) => submit(input));

export async function submit({ form, entry }: Record<string, any>) {
  if (form !== "FBTWTe") {
    throw generalBadRequestError();
  }

  /**
   * Missing keys will be ignored
   */
  const otherKeys: Record<string, string> = {
    "field_165":  "",
    "field_149":  "",
    "field_161":  "",
    "field_107":  "",
    "field_108":  "",
    "field_167":  "",
    "field_169":  "",
    "field_168":  "",
    "field_156":  "",
    "field_162":  "",
    "field_155":  "",
    "field_133":  "",
    "field_134":  "",
    "field_135":  "",
    "field_136":  "",
    "field_163":  "",
    "field_164":  "",
    "field_139":  "",
    "field_140":  "",
    "field_157":  "",
    "field_144":  "",
    "field_145":  "",
    "field_121":  "",
    "field_119":  "",
    "field_112":  "",
    "field_127":  "",
    "field_150":  "",
    "field_151":  "",
    "field_152":  "",
    "field_128":  "",
    "field_132":  "",
  };

  const application: Record<string, any> = {};
  for (const formKey of Object.keys(otherKeys)) {
    if (formKey in entry) {
      application[otherKeys[formKey]] = entry[formKey];
    }
  }

  await createUser({
    name: entry.field_104,
    sex: entry.field_57,
    email: entry.field_113,
    wechat: entry.field_106,
    menteeApplication: application,
    roles: ["Mentee"]
  });
}
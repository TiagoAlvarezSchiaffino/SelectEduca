import { procedure } from "../trpc";
import z from "zod";
import { generalBadRequestError } from "../errors";
import { createUser } from "../database/models/User";
import { emailRoleIgnoreError } from "../sendgrid";
import menteeApplicationFields from "../../shared/menteeApplicationFields";

export default procedure
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ ctx, input }) => submit(input, ctx.baseUrl));

export async function submit({ form, entry }: Record<string, any>, baseUrl: string) {
  if (form !== "FBTWTe" && form !== "S74k0V") {
    throw generalBadRequestError(`form id ${form} is not suppoted.`);
  }

  const application: Record<string, any> = {};
  for (const field of menteeApplicationFields) {
    const jn = form == "FBTWTe" ? field.jsjField : field.jsjProxiedField;
    if (jn && jn in entry) {
      application[field.name] = entry[jn];
    }
  }

  const name = entry.field_104;
  await createUser({
    name,
    sex: entry.field_57,
    email: entry.field_113,
    wechat: entry.field_106,
    menteeApplication: application,
    roles: ["Mentee"]
  }, "upsert");

  emailRoleIgnoreError("UserManager", "", `${name}`, baseUrl);
}
import {
  Flex,
  Box,
  Link,
  UnorderedList,
  ListItem,
  Heading,
  Text,
  useClipboard,
  Tooltip,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { CopyIcon, DownloadIcon } from '@chakra-ui/icons';
import Loader from 'components/Loader';
import trpc, { trpcNext } from 'trpc';
import menteeApplicationFields from 'shared/menteeApplicationFields';
import z from "zod";
import { sectionSpacing } from 'theme/metrics';
import { formatUserName } from 'shared/strings';
import invariant from "tiny-invariant";
import EditableWithIcon from "components/EditableWithIcon";
import User from 'shared/User';
import { useUserContext } from 'UserContext';
import { isPermitted } from 'shared/Role';
import NextLink from "next/link";
import { toast } from 'react-toastify';

export default function MenteeApplicant({ userId, showTitle, useNameAsTitle } :
{
  userId: string,
  showTitle?: boolean,
  useNameAsTitle?: boolean, // Valid only if showTitle is true
}) {
  const { data, refetch } = trpcNext.users.getApplicant.useQuery({
    userId, type: "MenteeInterview"
  });

  return !data ? <Loader /> :
  <LoadedApplicant user={data.user} application={data.application}
    showTitle={showTitle} useNameAsTitle={useNameAsTitle} refetch={refetch}
    />;
}

function LoadedApplicant({ user, application, showTitle, useNameAsTitle,
  refetch
} : {
  user: User,
  application: Record<string, any> | null,
  refetch: () => void,
  showTitle?: boolean,
  useNameAsTitle?: boolean,
}) {
  const [me] = useUserContext();
  const isMenteeManager = isPermitted(me.roles, "MenteeManager");

  const update = async (name: string, value: string) => {
    const updated = structuredClone(application ?? {});
    updated[name] = value;
    await trpc.users.updateApplication.mutate({
      type: "MenteeInterview",
      userId: user.id,
      application: updated,
    });
    refetch();
  };

  return <Flex direction="column" gap={sectionSpacing}>
    {showTitle && <Heading size="md">{useNameAsTitle ?
      `${formatUserName(user.name)}` : "Application materials"}</Heading>}

    {user.genre && <FieldRow name="Gender" readonly value={user.genre} />}

    <ContactFieldRow readable={isMenteeManager} 
        name="WeChat" value={user.wechat ?? '(WeChat not provided)'} />
    <ContactFieldRow readable={isMenteeManager}
        name="Mail" value={user.email} />

{menteeApplicationFields.map(f => {
      if (application && f.name in application) {
        return <FieldRow readonly={!isMenteeManager} key={f.name} name={f.name}
          value={application[f.name]}
          update={v => update(f.name, v)}
        />;
      } else if (isMenteeManager && f.showForEdits) {
        return <FieldRow readonly={false} key={f.name} name={f.name}
          value={''}
          update={v => update(f.name, v)}
        />;
      }
})}
  </Flex>;
}

function ContactFieldRow({ readable, name, value }: { 
  readable: boolean,
  name: string,
  value: string 
}) {
  // clipboard doesn't support copying of empty strings
  invariant(value !== "");
  const { onCopy, hasCopied } = useClipboard(value);

  useEffect(() => {
    if (hasCopied) toast.success("The content has been copied to the clipboard.");
  }, [hasCopied]);

  return <Flex direction="column">
    <Flex>
      <b>{name}{' '}</b>
      {!readable && <Text color="grey">
        （Please contact<Link as={NextLink} href="/who-can-see-my-data">Student Administrator</Link>）
      </Text>}
    </Flex>
    <Box>
      ••••••••••••{' '}
      {readable &&
        <Tooltip label="Copy content to clipboard">
          <CopyIcon onClick={onCopy} cursor="pointer" />
        </Tooltip>
      }
    </Box>
  </Flex>;
}

function FieldRow({ name, value, readonly, update }: {
  name: string,
  value: any,
  readonly: boolean,
  update?: (value: string) => Promise<void>,  // required only if !readonly
}) {
  return <Flex direction="column">
    <Box><b>{name}</b></Box>
    <Box>
      <FieldValueCell value={value} readonly={readonly} update={update} />
    </Box>
  </Flex>;
}

function FieldValueCell({ value, readonly, update }: {
  value: any,
  readonly: boolean,
  update?: (value: string) => Promise<void>,  // required only if !readonly
}) {
  invariant(readonly || update);

  if (Array.isArray(value)) {
    return <UnorderedList>
      {value.map((v, idx) => <ListItem key={idx}>
        {/* Don't allow edits for child values */}
        <FieldValueCell readonly value={v} />
      </ListItem>)}
    </UnorderedList>;
  } else if (z.string().url().safeParse(value).success) {
    return <Link href={value}>
      Download Link <DownloadIcon />
    </Link>;
  } else if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  } else if (typeof value === "string") {
    const v = value.split("\n").join("\r\n");
    return readonly ?
      value.split("\n").map((p, idx) => <p key={idx}>{p}</p>)
      :
      <EditableWithIcon mode="textarea" defaultValue={v} onSubmit={update} />;
  } else {
    return value;
  }
}

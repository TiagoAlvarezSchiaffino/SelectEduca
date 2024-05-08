import { Td } from '@chakra-ui/react';
import React from 'react';
import { MentorshipWithGroup } from 'shared/Mentorship';
import { formatUserName, prettifyDate, toPinyin } from 'shared/strings';
import TrLink from 'components/TrLink';
import moment from 'moment';
import { trpcNext } from 'trpc';
import TdLink from './TdLink';
import EditIconButton from './EditIconButton';

export function MentorshipTableRow({ mentorship: m, showCoach, showPinyin, edit }: {
  mentorship: MentorshipWithGroup;
  showCoach?: boolean,
  showPinyin?: boolean,
  edit?: (m: MentorshipWithGroup) => void,
}) {
  const { data: coach } = trpcNext.users.getCoach.useQuery({ userId: m.mentor.id });

  let msg;
  let color;

  const href=`/mentorships/${m.id}`;

  return <TrLink>
    <TdLink href={href}>{formatUserName(m.mentee.name)}</TdLink>
    <TdLink href={href}>{formatUserName(m.mentor.name)}</TdLink>
    {showCoach && <TdLink href={href}>{coach && formatUserName(coach.name)}</TdLink>}
    {edit && <Td><EditIconButton onClick={() => edit(m)} /></Td>}

<TdLink href={href} color={color}>{msg}</TdLink>

{showPinyin && <TdLink href={href}>
      {toPinyin(m.mentee.name ?? "")},{toPinyin(m.mentor.name ?? "")}
      {coach && "," + toPinyin(coach.name ?? "")}
    </TdLink>}
    <Td color={color}>{msg}</Td>
  </TrLink>;
}
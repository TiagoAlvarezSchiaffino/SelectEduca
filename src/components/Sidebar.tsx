import React from 'react';
import {
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Text,
  BoxProps,
  Divider,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useUserContext } from 'UserContext';
import { isPermitted } from 'shared/Role';
import Image from "next/image";
import { useRouter } from 'next/router';
import { trpcNext } from 'trpc';
import { Mentorship } from 'shared/Mentorship';
import {
  MdPerson,
  MdGroups,
  MdScience,
  MdChevronRight, 
  MdFace, 
  MdVideocam,
  MdSupervisorAccount,
  MdMic
} from 'react-icons/md';
import Role from "../shared/Role";
import { sidebarBreakpoint, sidebarContentMarginTop, sidebarWidth, topbarHeight } from './Navbars';
import { formatUserName } from 'shared/strings';
import { AttachmentIcon } from '@chakra-ui/icons';

export interface SidebarItem {
  name: string,
  icon: React.ComponentType,
  path: string,
  regex: RegExp,
  role?: Role,
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'My Meeting',
    path: '/',
    icon: MdVideocam,
    // match "/", "/groups/.*" but not "/groups/lab.*". "?" is a lookahead sign
    regex: /^\/$|\/groups\/(?!lab).*/,
  },
  {
    name: 'Senior Tutor Page',
    path: '/coachees',
    icon: MdSupervisorAccount,
    regex: /^\/coachees/,
    role: 'MentorCoach',
  },
  {
    name: 'Student Profile',
    path: '/mentees?menteeStatus=CurrentStudents',
    icon: AttachmentIcon,
    regex: /^\/mentees/,
    role: 'MenteeManager',
  },
  {
    name: 'My Interview',
    path: '/interviews/mine',
    icon: MdMic,
    regex: /^\/interviews\/mine/,
    role: 'Interviewer',
  },
  {
    name: 'Abstract R&D',
    path: '/groups/lab',
    icon: MdScience,
    regex: /^\/groups\/lab/,
    role: 'SummaryEngineer',
  },
  {
    name: 'Manage Users',
    path: '/users',
    icon: MdPerson,
    regex: /^\/users/,
    role: 'UserManager',
  },
  {
    name: 'Manage Meeting Groups',
    path: '/groups',
    icon: MdGroups,
    regex: /^\/groups$/,
    role: 'GroupManager',
  },
];

function mentorships2Items(mentorships: Mentorship[] | undefined): SidebarItem[] {
  if (!mentorships) return [];
  return mentorships.map(m => ({
    name: formatUserName(m.mentee.name),
    icon: MdFace,
    path: `/mentees/${m.mentee.id}`,
    regex: new RegExp(`^\/mentees\/${m.mentee.id}`),
  }));
}

const sidebarItemPaddingY = 4;

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const Sidebar = ({ onClose, ...rest }: SidebarProps) => {
  const [me] = useUserContext();
  // Save an API call if the user is not a mentor.
  const { data: mentorships } = isPermitted(me.roles, "Mentor") ? 
    trpcNext.mentorships.listMineAsMentor.useQuery() : { data: undefined };
  const mentorshipItems = mentorships2Items(mentorships);

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: "full", [sidebarBreakpoint]: sidebarWidth }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex 
        height={topbarHeight}
        alignItems="center"
        marginX="8" 
        justifyContent="space-between"
      >
        <Box display={{ base: 'none', [sidebarBreakpoint]: 'flex' }}>
          <NextLink href="http://.org" target="_blank">
            <Image
              src={} 
              alt="" 
              width={112}
              priority
              />
            </NextLink>
        </Box>
        <CloseButton display={{ base: 'flex', [sidebarBreakpoint]: 'none' }}
          onClick={onClose} />
      </Flex>
      <Box height={{
        base: 0,
        [sidebarBreakpoint]: sidebarContentMarginTop - sidebarItemPaddingY,
      }}/>

      {sidebarItems
        .filter(item => isPermitted(me.roles, item.role))
        .map(item => <SidebarRow key={item.path} item={item} onClose={onClose} />)}
      
      {mentorshipItems?.length > 0 && <Divider marginY={2} />}

      {mentorshipItems.map(item => <SidebarRow key={item.path} item={item}
        onClose={onClose} />)}
    </Box>
  );
};

export default Sidebar;

const SidebarRow = ({ item, onClose, ...rest }: {
  item: SidebarItem,
} & SidebarProps) => {
  const router = useRouter();
  const active = item.regex.test(router.pathname) || item.regex.test(router.asPath);
  return (
    <Link 
      as={NextLink} 
      href={item.path}
      color={active ? "brand.c" : "gray.500"}
      fontWeight="bold"
      onClick={onClose}
    >
      <Flex
        align="center"
        marginX={4}
        paddingLeft={4}
        paddingY={sidebarItemPaddingY}
        role="group"
        cursor={active ? "default" : "pointer"}
        {...rest}
      >
        <Icon as={item.icon} />
        <Text marginX={4}>{item.name}</Text>
        <Icon
          as={MdChevronRight}
          opacity={0}
          _groupHover={active ? {} : { opacity: 100 }}
        />
      </Flex>
    </Link>
  );
};
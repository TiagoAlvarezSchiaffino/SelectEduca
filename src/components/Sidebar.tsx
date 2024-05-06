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
import { MdChevronRight, MdFace } from 'react-icons/md';
import { trpcNext } from 'trpc';
import { Partnership } from 'shared/Partnership';
import {
  MdPerson,
  MdHome,
  MdGroups,
  MdScience,
  MdGroup,
  MdChevronRight, 
  MdFace, 
  MdFace5, 
  MdFaceUnlock, 
  MdOutlineSyncAlt, 
  MdVideocam
} from 'react-icons/md';
import Role from "../shared/Role";
import { IconType } from "react-icons";
import { sidebarBreakpoint, sidebarContentMarginTop, sidebarWidth, topbarHeight } from './Navbars';
import { parseQueryStringOrUnknown } from 'parseQueryString';
import { formatUserName } from 'shared/strings';

export interface SidebarItem {
  name: string,
  icon: IconType,
  path: string,
  regex: RegExp,
  role?: Role,
}

const sidebarItems: SidebarItem[] = [
  {
    name: '',
    path: '/',
    icon: MdVideocam,
    // match "/", "/groups/.*" but not "/groups/lab.*". "?" is a lookahead sign
    regex: /^\/$|\/groups\/(?!lab).*/,
  },
  {
    name: '',
    path: '/interviews/mine',
    icon: MdFace5,
    regex: /'\/interviews\/mine'/,
    role: 'Interviewer',
  },
  {
    name: '',
    path: '/groups/lab',
    icon: MdScience,
    regex: /'\/groups\/lab'/,
    role: 'SummaryEngineer',
  },
  {
    name: '',
    path: '/users',
    icon: MdPerson,
    regex: /'\/user'/,
    role: 'UserManager',
  },
  {
    name: '',
    path: '/groups',
    icon: MdGroups,
    regex: /'^\/groups$'/,
    role: 'GroupManager',
  },
  {
    name: '',
    path: '/interviews?type=mentee',
    icon: MdGroup,
    regex: /'\/interviews\\?type=mentee'/,
    role: 'InterviewManager',
  },
  {
    name: '',
    path: '/interviews?type=mentor',
    icon: MdGroup,
    regex: /'\/interviews\\?type=mentor'/,
    role: 'InterviewManager',
  },
  {
    name: '',
    path: '/partnerships',
    icon: MdGroup,
    regex: /'^\/partnerships$'/,
    role: 'PartnershipManager',
  },
];

function partnerships2Items(partnerships: Partnership[] | undefined): SidebarItem[] {
  if (!partnerships) return [];
  return partnerships.map(p => ({
    name: formatUserName(p.mentee.name, "formal"),
    icon: MdFace,
    path: `/partnerships/${p.id}`,
    regex: /'\/partnerships\/.'/,
  }));
}

const sidebarItemPaddingY = 4;

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const Sidebar = ({ onClose, ...rest }: SidebarProps) => {
  const [me] = useUserContext();
  // Save an API call if the user is not a mentor.
  const { data: partnerships } = isPermitted(me.roles, "Mentor") ? 
    trpcNext.partnerships.listMineAsMentor.useQuery() : { data: undefined };
  const partnershipItems = partnerships2Items(partnerships);

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
          <Image
            src={yuanjianLogo224x97} 
            alt="" 
            width={112}
            priority
            />
        </Box>
        <CloseButton display={{ base: 'flex', [sidebarBreakpoint]: 'none' }} onClick={onClose} />
      </Flex>
      <Box height={{
        base: 0,
        [sidebarBreakpoint]: sidebarContentMarginTop - sidebarItemPaddingY,
      }}/>

      {sidebarItems
        .filter(item => isPermitted(me.roles, item.role))
        .map(item => <SidebarRow key={item.path} item={item} onClose={onClose} />)}

      {partnershipItems?.length > 0 && <Divider marginY={2} />}

      {partnershipItems.map(item => <SidebarRow key={item.path} item={item} onClose={onClose} />)}
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
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Divider,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiChevronDown,
} from 'react-icons/fi';
import { LockIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { Guard, useGuard } from "@authing/guard-react18";
import { useUserContext } from 'UserContext';
import sidebarItems, { SidebarItem } from 'sidebarItems';
import { isPermitted } from 'shared/Role';

import Image from "next/image";
import { useRouter } from 'next/router';
import { MdChevronRight, MdFace } from 'react-icons/md';
import colors from 'theme/colors';
import AutosaveIndicator, { 
    AutosaveState,
    addPendingSaver,
    initialState,
    removePendingSaver,
    setPendingSaverError
  } from './AutosaveIndicator';
import AutosaveContext from 'AutosaveContext';
import { trpcNext } from 'trpc';
import { Partnership } from 'shared/Partnership';

const sidebarWidth = 60;
export const topbarHeight = "60px";
export const sidebarBreakpoint = "lg";
export const sidebarContentMarginTop = 10;

export default function Navbars({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ autosaveState, setAutosateState] = useState<AutosaveState>(initialState);

  /**
   * Use a reference holder to keep the values of addPS and removePS independent of autosaveState, and thus avoid
   * re-rendering the whole page every time autosaveState changes.
   */
  const ref = useMemo(() => ({ state: initialState }), []);
  const addPS = useCallback((id: string) => {
    ref.state = addPendingSaver(ref.state, id);
    setAutosateState(ref.state);
  }, [ref]);
  const removePS = useCallback((id: string) => {
    ref.state = removePendingSaver(ref.state, id);
    setAutosateState(ref.state);
  }, [ref]);
  const setPSError = useCallback((id: string, e?: any) => {
    ref.state = setPendingSaverError(ref.state, id, e);
    setAutosateState(ref.state);
  }, [ref]);

  return (
    <Box minHeight="100vh" bg={useColorModeValue(colors.backgroundLight, colors.backgroundDark)}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', [sidebarBreakpoint]: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <Topbar onOpen={onOpen} autosaveState={autosaveState} />
      <Box marginLeft={{ base: 0, [sidebarBreakpoint]: sidebarWidth }}>
        <AutosaveContext.Provider value={{
          addPendingSaver: addPS,
          removePendingSaver: removePS,
          setPendingSaverError: setPSError,
        }}>
          {children}
        </AutosaveContext.Provider>
      </Box>
    </Box>
  );
}

/**
 * TODO: Extract Sidebar functions to a separate file
 */
const sidebarItemPaddingY = 4;

function partnerships2sidebarItems(partnerships: Partnership[] | undefined): SidebarItem[] {
  if (!partnerships) return [];
  return partnerships.map(p => ({
    name: p.mentee.name ?? '',
    icon: MdFace,
    path: `/partnership/${p.id}`,
  }));
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}
const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    const [me] = useUserContext();
    const { data: partnerships } = trpcNext.partnerships.listMineAsMentor.useQuery();
    const partnershipItems = partnerships2sidebarItems(partnerships);
  // Save an API call if the user is not a mentor.
  const { data: partnerships } = isPermitted(me.roles, "Mentor") ? 
    trpcNext.partnerships.listMineAsMentor.useQuery() : { data: undefined };
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
            src={} 
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

interface SidebarRowProps extends SidebarProps {
  item: SidebarItem,
}
const SidebarRow = ({ item, onClose, ...rest }: SidebarRowProps) => {
  const { pathname } = useRouter();
  const active = pathname === item.path;
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

interface TopbarProps extends FlexProps {
    onOpen: () => void,
    autosaveState: AutosaveState,
}

const Topbar = ({ onOpen, autosaveState, ...rest }: TopbarProps) => {
	const guard = useGuard();
	const [user] = useUserContext();

  return (
    <Flex
      position="sticky"
      top={0}
      zIndex={200}

      marginLeft={{ base: 0, [sidebarBreakpoint]: sidebarWidth }}
      paddingX={4}
      height={topbarHeight}
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between' }}
      {...rest}
    >
      <HStack spacing={6}>
        <IconButton
          display={{ base: 'flex', [sidebarBreakpoint]: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
        />
        <AutosaveIndicator
          display={{ base: 'none', [sidebarBreakpoint]: 'flex' }}
          state={autosaveState} 
        />
      </HStack>

      <Box display={{ base: 'flex', [sidebarBreakpoint]: 'none' }}>
        <Image src={} alt="" width={40} />
      </Box>

      <HStack spacing={{ base: '0', [sidebarBreakpoint]: '6' }}>
        {/* <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
        /> */}
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar
                  size={'sm'}
                  bg="brand.a"
                  color="white"
                  name={user.name || ""}
                />
                <Text 
                  display={{ base: 'none', [sidebarBreakpoint]: 'flex' }}
                  marginLeft="2"
                  fontSize="sm"
                >
                  {user.name || ""}
                </Text>
                <Box display={{ base: 'none', [sidebarBreakpoint]: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}>
              <MenuItem as={NextLink} href='/profile'>
              </MenuItem>
              <MenuDivider />
              <MenuItem as={NextLink} href='/whocanseemydata'>
                <LockIcon marginRight={1} />
              </MenuItem>
              <MenuDivider />
              <MenuItem
                onClick={async () => {
                  await logout.call(guard);
                  location.href = '/';
                }}              
              ></MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

const logout = async function (this: Guard) {
	const authClient = await this.getAuthClient();
	await authClient.logout();
	localStorage.clear();
}

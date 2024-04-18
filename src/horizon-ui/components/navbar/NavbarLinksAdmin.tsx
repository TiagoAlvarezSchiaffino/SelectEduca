// Chakra Imports
import {
	Avatar,
	Flex,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	Text,
	useColorModeValue,
} from '@chakra-ui/react';
// Custom Components
import { SidebarResponsive } from 'horizon-ui/components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React from 'react';
// Assets
import routes from 'routes';
import { Guard, useGuard } from "@authing/guard-react18";
import useUserContext from '../../../useUserContext';
import Link from 'next/link';

const logout = async function (this: Guard) {
	const authClient = await this.getAuthClient();
	await authClient.logout();
	localStorage.clear();
}

export default function HeaderLinks(props: { secondary: boolean }) {
	const { secondary } = props;
	// Chakra Color Mode
	let menuBg = useColorModeValue('white', 'navy.800');
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);

	const guard = useGuard();
	const [user] = useUserContext();

	return (
		<Flex
			w={{ sm: '100%', md: 'auto' }}
			alignItems='center'
			flexDirection='row'
			bg={menuBg}
			flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
			p='10px'
			borderRadius='30px'
			boxShadow={shadow}
			>
			<SidebarResponsive routes={routes} />
			<Menu>
				<MenuButton p='0px'>
					<Avatar
						_hover={{ cursor: 'pointer' }}
						color='white'
						name={user.name || user.email || ""}
						bg='#11047A'
						size='sm'
						w='40px'
						h='40px'
					/>
				</MenuButton>
				<MenuList boxShadow={shadow} p='0px' mt='10px' borderRadius='20px' bg={menuBg} border='none'>
				<MenuItem as={Link} href='/profile'>
            <Text fontSize='sm'></Text>
          </MenuItem>
          <MenuDivider />
          <MenuItem
            _hover={{ bg: 'none' }}
            _focus={{ bg: 'none' }}
            color='red.400'
            borderRadius='8px'
            px='14px'
            onClick={async () => {
              await logout.call(guard);
              location.href = '/';
            }}
          >
            <Text fontSize='sm'></Text>
          </MenuItem>
				</MenuList>
			</Menu>
		</Flex>
	);
}

HeaderLinks.propTypes = {
	variant: PropTypes.string,
	fixed: PropTypes.bool,
	secondary: PropTypes.bool,
	onOpen: PropTypes.func
};
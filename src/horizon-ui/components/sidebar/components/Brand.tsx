// Chakra imports
import { Divider, Flex } from '@chakra-ui/react';

import Image from "next/image";

export function SidebarBrand() {
	return (
		<Flex alignItems='center' flexDirection='column'>
			<Divider padding="3" />
		</Flex>
	);
}

export default SidebarBrand;

// Chakra imports
import { Divider, Flex } from '@chakra-ui/react';

import Image from "next/image";

export function SidebarBrand() {
	return (
		<Flex alignItems='center' flexDirection='column'>
			<Image src={} alt="" style={{ width: 150 }}/>
			<Divider padding="3" />
		</Flex>
	);
}

export default SidebarBrand;
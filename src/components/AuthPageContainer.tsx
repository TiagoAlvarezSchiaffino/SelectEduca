import { Box, Flex, VStack } from '@chakra-ui/react';
import Image from "next/image";
import { componentSpacing } from 'theme/metrics';
import Logo80x80 from '../../public/img/-logo-80x80.png';
import { PropsWithChildren } from "react";

export default function AuthPageContainer({ children, ...rest }: PropsWithChildren) {
  return <Flex direction="column" justifyContent="center" alignItems="center" minHeight="100vh" {...rest}>
    <VStack align="left" spacing={componentSpacing} width={350}>

      <Image src={Logo80x80} alt="" width={60} 
        priority
      />

      {children}
    </VStack>
    <Box height={40} />
  </Flex>;
}
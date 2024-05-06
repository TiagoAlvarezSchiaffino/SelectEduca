import { Box, Flex, VStack, Heading } from '@chakra-ui/react';
import Image from "next/image";
import { componentSpacing } from 'theme/metrics';
import Logo80x80 from '../../public/img/-logo-80x80.png';
import { ReactNode } from "react";

export default function AuthPageContainer({ title, children }: {
  title: string,
  children: ReactNode
}) {
  return <Flex direction="column" justifyContent="center" alignItems="center" minHeight="100vh">
    <VStack align="left" spacing={componentSpacing} width={350}>
      <Image src={Logo80x80} alt="" width={60} 
        priority
      />

      <Heading size="md" marginBottom={10}>{title}</Heading>

      {children}

    </VStack>

    <Box height={40} />
  </Flex>;
}
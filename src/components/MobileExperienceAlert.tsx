import { Alert, AlertIcon, AlertDescription, HStack } from '@chakra-ui/react';
import { sidebarBreakpoint } from 'components/Navbars';


export default function MobileExperienceAlert() {
  return <Alert status="warning" display={{ [sidebarBreakpoint]: "none" }}>
  <HStack>
    <AlertIcon />
    <AlertDescription></AlertDescription>
  </HStack>
  </Alert>;
}
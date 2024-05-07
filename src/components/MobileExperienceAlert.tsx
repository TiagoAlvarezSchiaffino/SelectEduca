import { Alert, AlertIcon, AlertDescription, HStack, AlertProps } from '@chakra-ui/react';
import { sidebarBreakpoint } from 'components/Navbars';


export default function MobileExperienceAlert(props: AlertProps) {
  return <Alert status="warning" display={{ [sidebarBreakpoint]: "none" }} {...props}>
    <HStack>
      <AlertIcon />
      <AlertDescription>This page contains a lot of content. For the best user experience, we recommend using a desktop browser.</AlertDescription>
    </HStack>
  </Alert>;
}
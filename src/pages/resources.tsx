import { Text, Box } from '@chakra-ui/react';
  import React from 'react';
  import { useUserContext } from "../UserContext";
  import { isPermitted } from 'shared/Role';
  import { fullPage } from 'AppPage';
  import { sidebarBreakpoint } from 'components/Navbars';
  import { sidebarContentMarginTop } from 'components/Sidebar';

  export default fullPage(() => {
    const [user] = useUserContext();
    if (!isPermitted(user.roles, ["Mentee", "Mentor", "MentorCoach"])) {
      return <Text>Don't have permission to view this page.</Text>;
    }

    return (
      <Box
        width="100%"
        height="100vh"
        marginTop={{ base: sidebarContentMarginTop, [sidebarBreakpoint]: -sidebarContentMarginTop }}
      >
        <iframe
          src=""
          width="100%"
          height="100%"
        />
      </Box>
    )
  })
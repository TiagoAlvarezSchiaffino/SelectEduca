import {
    Text,
    Box
  } from '@chakra-ui/react';
  import React from 'react';
  import { useUserContext } from "../UserContext";
  import { isPermitted } from 'shared/Role';
  import { fullPage } from 'AppPage';
  import { topbarHeight } from "../components/Navbars";

  export default fullPage(() => {
    const [user] = useUserContext();
    if (!isPermitted(user.roles, ["Mentee", "Mentor", "MentorCoach"])) {
      return <Text>Don't have permission to view this page.</Text>;
    }

    return (
      <Box h={`calc(100vh - ${topbarHeight})`}>
        <iframe src="" width="100%" height="100%"/>
      </Box>
    )
  })
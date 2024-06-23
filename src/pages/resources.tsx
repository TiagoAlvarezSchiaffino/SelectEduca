import {
    Text,
  } from '@chakra-ui/react';
  import React from 'react';
  import { useUserContext } from "../UserContext";
  import { isPermitted } from 'shared/Role';
  import { widePage } from 'AppPage';
  
  export default widePage(() => {
    const [user] = useUserContext();
    if (!isPermitted(user.roles, ["Mentee", "Mentor", "MentorCoach"])) {
      return <Text>Don't have permission to view this page.</Text>;
    }
  })
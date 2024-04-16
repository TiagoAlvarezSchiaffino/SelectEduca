import { Icon } from '@chakra-ui/react'
import {
  MdPerson,
  MdHome,
  MdAccountBox
} from 'react-icons/md'

import { IRoute } from 'horizon-ui/types/navigation'

const routes: IRoute[] = [
  {
    name: '',
    layout: '/',
    path: '/',
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    resource: 'my-groups:read',
  },
  {
    name: '',
    layout: '/',
    path: '/user-profile',
    icon: <Icon as={MdAccountBox} width='20px' height='20px' color='inherit' />,
    resource: 'me:write',
    hiddenFromSidebar: true,
  },
  {
    name: '',
    layout: '/',
    path: '/user-management',
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    resource: 'users:write',
  },
  {
    name: '',
    layout: '/',
    path: '/group-management',
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    resource: 'groups:write',
  },
]

export default routes
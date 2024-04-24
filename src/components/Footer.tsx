/*eslint-disable*/

import { Center, Flex, Link, List, ListItem, Text, useColorModeValue } from '@chakra-ui/react';
import Image from "next/image";

// The minimal height of the blank space between body and footer.
export const bodyFooterSpacing = 80;

export default function Footer() {
  const textColor = useColorModeValue('gray.400', 'white');
  const FooterItem = (props: any) =>
    <ListItem marginEnd={{
      base: '20px',
      md: '44px'
    }}>{props.children}</ListItem>;

  return (
    <Flex
      zIndex='3'
      flexDirection={{
        base: 'column',
        xl: 'row'
      }}
      alignItems={{
        base: 'center',
        xl: 'start'
      }}
      justifyContent='space-between'
      paddingX={{ base: '30px', md: '50px' }}
      paddingBottom='30px'
      paddingTop={`${bodyFooterSpacing}px`}
    >
      <Text
        color={textColor}
        textAlign={{
          base: 'center',
          xl: 'start'
        }}
        paddingBottom={{ base: '20px', xl: '0px' }}>
        {' '}
        <Text as='span' fontWeight='500' marginStart='4px'>
          &copy; {new Date().getFullYear()} 
        </Text>
      </Text>
      <List display='flex'>
        <FooterItem>
          <Link fontWeight='500' color={textColor} isExternal href='mailto:a@b.org'>
            
          </Link>
        </FooterItem>
        <FooterItem>
          <Link fontWeight='500' color={textColor} isExternal href=''>
            
          </Link>
        </FooterItem>
        <FooterItem>
          <Link fontWeight='500' color={textColor} isExternal href=''>
            
          </Link>
        </FooterItem>
        <Center opacity='50%'>
          <ListItem>
            <Link isExternal href="">
                <Image src={vercelBanner} alt="Vercel Banner" height="22" />
              </Link>
          </ListItem>
        </Center>
      </List>
    </Flex>
  );
}
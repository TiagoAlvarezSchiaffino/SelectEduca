import { Flex, Link, List, ListItem, Text } from '@chakra-ui/react';

// The minimal height of the blank space between body and footer.
export const bodyFooterSpacing = 80;

export default function Footer() {
  const color = 'gray.400';
  const FooterItem = (props: any) => <ListItem marginX={4}>{props.children}</ListItem>;

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
        color={color}
        fontWeight='500'
        textAlign={{
          base: 'center',
          xl: 'start'
        }}
        paddingBottom={{ base: '20px', [footerBreakpoint]: '0px' }}
      >
        &copy; {new Date().getFullYear()}
      </Text>
      <List display='flex'>
        <FooterItem>
          <Link fontWeight='500' color={color} isExternal href='mailto:a@b.org'>
            
          </Link>
        </FooterItem>
        <FooterItem>
          <Link fontWeight='500' color={color} isExternal href='mailto:a@b.org'>
            
          </Link>
        </FooterItem>
        <FooterItem>
          <Link fontWeight='500' color={color} isExternal href='mailto:a@b.org'>
            
          </Link>
        </FooterItem>
      </List>
    </Flex>
  );
}
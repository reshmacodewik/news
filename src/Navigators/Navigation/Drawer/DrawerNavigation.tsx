import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { drawerRoutes } from '../../routes';
import BottomTab from '../BottomTab/BottomTab';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  <>
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={props => {
        const filteredProps = {
          ...props,
          state: {
            ...props.state,
            routeNames: props.state.routeNames,
            routes: props.state.routes,
          },
        };
        return (
          <DrawerContentScrollView
            bounces={false}
            {...filteredProps}
            contentContainerStyle={{
              marginTop: Platform.OS === 'ios' ? 0 : 0,
              height: '100%',
              position: 'relative',
            }}
          >
            <DrawerItemList {...filteredProps} />
            <View
              style={{
                borderBottomWidth: 1,
                position: 'absolute',
                top: '7%',
                width: '100%',
              }}
            />
            <TouchableOpacity
              style={{ padding: 20, width: '100%' }}
              // onPress={handleLogout}
            >
              <View
                style={{
                  width: 82,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {/* <LogoutIcon />*/}
                <Text
                  style={{
                    // color: colors.primaryText,
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                >
                  logout
                </Text>
              </View>
            </TouchableOpacity>
          </DrawerContentScrollView>
        );
      }}
    >
      <Drawer.Screen
        name="MainTabNavigation"
        component={BottomTab}
        options={{
          drawerLabel: 'MainTabNavigation',
          headerShown: false,
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
      {drawerRoutes.map((item: any) => (
        <Drawer.Screen
          key={item.routeName}
          name={item.routeName}
          component={item.component}
          options={{
            drawerLabel: item.drawerLabel,
            drawerIcon: item.optionIcon,
            drawerLabelStyle: {
              marginLeft: -20,
              // color: colors.primaryText,
            },
            headerShown: item.headerShown,
            // header: item.headerShown
            //   ? item.header
            //     ? item.header
            //     : () => <Header headerHeading={t(item.headerHeading)} />
            //   : () => {},
          }}
        />
      ))}
    </Drawer.Navigator>
  </>;
};

export default DrawerNavigation;

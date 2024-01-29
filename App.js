import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from "./components/LoginScreen";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import WorkspacesScreen from "./components/WorkspacesScreen";
import WorkspaceDetailScreen from "./components/WorkspaceDetailScreen";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
   <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Workspaces" component={WorkspacesScreen} />
        <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetailScreen} options={({ route }) => ({ title: route.params.workspace.name + " details" })}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

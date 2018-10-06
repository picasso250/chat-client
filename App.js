import {
  createStackNavigator,
} from 'react-navigation';
import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
} from 'react-native';

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <Button
        title="Go to Jane's profile"
        onPress={() =>
          navigate('Profile', { name: 'Jane' })
        }
      />
    );
  }
}
class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'ProfileScreen',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <Button
        title="Go to Jane's profile"
        onPress={() =>
          navigate('Profile', { name: 'Jane' })
        }
      />
    );
  }
}

const App = createStackNavigator({
  Home: { screen: HomeScreen },
  Profile: { screen: ProfileScreen },
});

export default App;
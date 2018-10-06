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
  FlatList,
} from 'react-native';

class Msg extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ marginLeft: 10 }} >
          <Text style={styles.name}>{this.props.name}</Text>
        </View>
        <View style={{ margin: 10 }} >
          <Text style={styles.msg}>{this.props.msg}</Text>
        </View>
      </View>
    );
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: '不是微信的聊天',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <FlatList
          data={[
            { key: 'Devin' },
            { key: 'Jackson' },
            { key: 'James' },
            { key: 'Joel' },
            { key: 'John' },
            { key: 'Jillian' },
            { key: 'Jimmy' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
            { key: 'Julie' },
          ]}
          renderItem={({ item }) => <Msg name={item.key} msg={item.key}></Msg> }
        />
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  name: {
    color: '#666666',
    fontSize: 12,
  },
})

const App = createStackNavigator({
  Home: { screen: HomeScreen },
  Profile: { screen: ProfileScreen },
});

export default App;
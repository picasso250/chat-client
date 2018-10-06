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

  constructor(props) {
    super(props);
    this.state = { lst: [] }
  }

  render() {
    const host = __DEV__ ? '192.168.1.3' : 'chat.duozhihu.xyz';
    var data = [];
    fetch('http://' + host+ '/?api')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          lst: responseJson,
        }, function () {

        });
      })
      .catch((error) => {
        console.error(error);
      });
    console.log(data)

    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.lst}
          renderItem={({ item }) => 
            <Text 
              style={styles.item} 
              onPress={() =>
                navigate('Profile', { itemId: item.id, name: item.name })
              }
            >#{item.id} {item.name}</Text> }
          keyExtractor={(item, index) => item.id.toString()}
        />
      </View>
    );
  }
}
class ChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('name', 'A Chat'),
    };
  };
  render() {
    const { navigation } = this.props;
    const itemId = navigation.getParam('itemId', 'NO-ID');
    return (
      <View>
        <FlatList
          data={this.state.lst}
          renderItem={({ item }) =>
            <Msg name="{item.name}" msg="{item.msg}"></Msg>
          }
          keyExtractor={(item, index) => item.id.toString()}
        />
        
      </View>
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
  Profile: { screen: ChatScreen },
});

export default App;
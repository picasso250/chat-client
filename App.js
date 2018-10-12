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
import { AsyncStorage } from "react-native";
import Prompt from 'react-native-prompt-crossplatform';
import { Keyboard } from 'react-native'; 

const host = __DEV__ ? '192.168.1.3:8000' : 'chat.duozhihu.xyz';

class Msg extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ marginLeft: 10, paddingLeft: 20 }} >
          <Text style={styles.name}>{this.props.name}</Text>
        </View>
        <View style={{ margin: 10, paddingRight: 50 }} >
          <Text style={styles.msg}>{this.props.msg}</Text>
        </View>
      </View>
    );
  }
}

class HomeScreen extends React.Component {
  
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const _showPrompt = () => {
      
    }
    const { params = {} } = navigation.state
    return {
      title: '不是微信的聊天',
      headerRight: (
        <Button
          onPress={() => params.handleRemove()}
          title="我"
        />
      ),
    }
  };

  componentDidMount() {
    this.props.navigation.setParams({ handleRemove: this.removeVehicle })
  }

  removeVehicle = () => {
    this.setState({ visiblePrompt: true })
  }

  constructor(props) {
    super(props);
    this.state = {
      lst: [],
      visiblePrompt: false,
      name: '',
    }
    
    fetch('http://' + host + '/?api')
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

  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <Prompt
          title="你的名字"
          placeholder="你的名字"
          inputPlaceholder="你的名字"
          defaultValue={this.state.name}
          submitButtonText="好的！"
          cancelButtonText="懒得起名"
          isVisible={this.state.visiblePrompt}
          onChangeText={(text) => {
            this.setState({ name: text });
          }}
          onCancel={() => {
            this.setState({
              name: '懒得起名',
              visiblePrompt: false,
            });
          }}
          onSubmit={() => {
            this.setState({
              visiblePrompt: false,
            });
            AsyncStorage.setItem('name', this.state.name);
          }}
        />
        <FlatList
          data={this.state.lst}
          renderItem={({ item }) => 
            <Text 
              style={styles.item} 
              onPress={() =>
                navigate('Profile', { room_id: item.id, name: item.name })
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
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = { 
      lst: [],
      aboutToSendText: '',
      room_id: navigation.getParam('room_id', 'NO-ID'),
      name: '',
      btnLocation: 0,
      refreshing: false,
    }
    AsyncStorage.getItem('name', (err, res) => {
      this.setState({name: res?res:'懒得起名'});
    });

    this._alwaysPullMsg();
  }
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  _keyboardDidShow(e) {
    this.setState({ btnLocation: e.endCoordinates.height })
  }

  _keyboardDidHide() {
    this.setState({ btnLocation: 0 });
  }

  _alwaysPullMsg() {
    const room_id = this.state.room_id;
    // 创建一个Socket实例
    var socket = new WebSocket(__DEV__ ? ('ws://' + '192.168.1.3:8080'):('ws://' + host + ':8080'));
    let scrollToEnd = () => {
      if (this._lstView !== null) {
        this._lstView.scrollToEnd();
      }
    } 
    const appendMsg = (msg) => {
      var lst = this.state.lst;
      lst.push(msg);

      this.setState({ lst });
      this.setState({ refreshing: false });
      // 卷到底部
      setTimeout(() => {
        scrollToEnd();
      }, 200);
    }

    // 打开Socket 
    socket.onopen = function (event) {

      // 发送一个初始化消息
      socket.send(room_id.toString());

      // 监听消息
      socket.onmessage = function (event) {
        var msg = JSON.parse(event.data);
        appendMsg(msg);
      };

      // 监听Socket的关闭
      socket.onclose = function (event) {
        console.log('Client notified socket has closed', event);
      };

      // 关闭Socket....
      //socket.close() 
    };
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={{flex:1,backgroundColor:"#ffffff"}}>
        <FlatList
          style={{ 
            paddingTop:10, 
          }}
          ref={(c) => this._lstView = c}
          data={this.state.lst}
          renderItem={({ item }) =>
            <Msg name={item.name} msg={item.msg}></Msg>
          }
          keyExtractor={(item, index) => index.toString()}
          refreshing={this.state.refreshing}
        />
        <View style={{
          position: this.state.btnLocation==0?"relative":"absolute",
          bottom: this.state.btnLocation,
          left: 0,
          right: 0,
          backgroundColor: "#ffffff",
          }}>
          <TextInput
            style={{ height: 40 }}
            placeholder="说点什么"
            onChangeText={(text) => this.setState({ aboutToSendText: text })}
            value={this.state.aboutToSendText}
          />
          <Button onPress={(text) => this._pushMsg()} title="发送"></Button>
        </View>
      </View>
    );
  }

  _pushMsg() {
    const msg = this.state.aboutToSendText;
    if (msg === '') return;
    const data = {
      group_id: this.state.room_id,
      name: this.state.name,
      msg: msg,
    };
    console.log(data)
    this.setState({ refreshing: true });
    fetch('http://' + host +'/?a=send_msg&jsonBody', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((response) => response.json())
    .then((responseJson) => {
      this.setState({ aboutToSendText:''})
      Keyboard.dismiss();
    })
    .catch((error) => {
      console.error(error);
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
    backgroundColor: "#efeff7",
  },
  item: {
    padding: 18,
    fontSize: 18,
    height: 68,
    margin: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  name: {
    color: '#666666',
    fontSize: 12,
  },
  msg: {
    backgroundColor: "#e7eff7",
    padding: 15,
    borderRadius: 25,
  }
})

const App = createStackNavigator({
  Home: { screen: HomeScreen },
  Profile: { screen: ChatScreen },
});

export default App;
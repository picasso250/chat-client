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

const host = __DEV__ ? '192.168.1.3' : 'chat.duozhihu.xyz';

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

// const { DeviceEventEmitter } = React

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
      visiblePrompt: false,
      name: '',
      btnLocation: 0,
    }
    AsyncStorage.getItem('name', (err, res) => {
      if (!res) {
        this.state.visiblePrompt = true;
      }
    });

    this._alwaysPullMsg();
  }
  componentWillMount() {
    console.log('componentWillMount')
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  _keyboardDidShow(e) {
    alert('Keyboard Shown');
    console.log(e.endCoordinates.height);
    this.setState({ btnLocation: e.endCoordinates.height })
  }

  _keyboardDidHide() {
    alert('Keyboard Hidden');
    this.setState({ btnLocation: 0 });
  }

  _alwaysPullMsg() {
    const room_id = this.state.room_id;
    // 创建一个Socket实例
    var socket = new WebSocket('ws://' + host + ':8080');
    const scrollToEnd = () => this.refs.lstView.scrollToEnd();
    const appendMsg = (msg) => {
      var lst = this.state.lst;
      lst.push(msg);
      this.setState({ lst });
      // 卷到底部
      setTimeout(() => {
        scrollToEnd();
      }, 200);
    }
    const getV = () => this.refs.lstView.getInnerViewNode()

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
      <View style={{flex:1}}>
        <Prompt
          title="你的名字"
          placeholder="你的名字"
          inputPlaceholder="你的名字"
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
          style={{ 
            paddingTop:10, 
          }}
          ref='lstView'
          data={this.state.lst}
          renderItem={({ item }) =>
            <Msg name={item.name} msg={item.msg}></Msg>
          }
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={{
          bottom: this.btnLocation,
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
    fetch('http://' + host +'/?a=send_msg&jsonBody', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((response) => response.json())
    .then((responseJson) => {
      this.setState({ aboutToSendText:''})
    })
    .catch((error) => {
      console.error(error);
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22
  },
  item: {
    padding: 15,
    fontSize: 18,
    height: 64,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
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
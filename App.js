import { StyleSheet, View, Button, Alert, Platform, Text, Keyboard, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import TaskItem from './components/TaskItem'
import TaskInputField from './components/TaskInputField'

const colors = {
  themeColor: "#4263ec",
  white: "#fff",
  background: "#f4f6fc",
  greyish: "#a4a4a4",
  tint: "#2b49c3",
};

Notifications.setNotificationHandler({
  handleNotification: async (notif) => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [text, setText] = useState('-');
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    if (task == null) return;
    setTasks([...tasks, task]);
    Keyboard.dismiss();
  }

  const deleteTask = (deleteIndex) => {
    setTasks(tasks.filter((value, index) => index != deleteIndex));
  }

  const onChange = (event, selectedDate) => {
    const currentDate = selerctedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    let today = new Date();
    let count = Math.round((selectedDate.getTime() - today.getTime())/1000);
    
    Notifications.scheduleNotificationAsync({
      content: {
        title: "reminder",
        body: "this is the body of the notification",
        data: { userName: "ramya" },
      },
      trigger: {
        seconds: count,
      },
    });
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Permission required", "push notifs need permissions");
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      // console.log(pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }

    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        // console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );
    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        // console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "first local notification",
        body: "this is the body of the notification",
        data: { userName: "ramya" },
      },
      trigger: {
        seconds: 5,
      },
    });
  }
  function sendPushNotificationHandler() {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[rCtwBvJkZ4n8ftI6GsMIfa]",
        title: "Test- sent from a device!",
        body: "This is a test",
      }),
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>reminders</Text>
        <ScrollView style={styles.scrollView}>
         {
         tasks.map((task, index) => {
           return (
             <View key={index} style={styles.taskContainer}>
               <TaskItem index={index + 1} task={task} deleteTask={() => deleteTask(index)}/>
             </View>
           );
         })
       }
       <View style={{margin: 20}}>
        <Button title='DatePicker' onPress={() => showMode('date')} />
      </View>
      <View style={{margin: 20}}>
        <Button title='TimePicker' onPress={() => showMode('time')} />
      </View>
      {show && (
        <DateTimePicker
        testID='dateTimePicker'
        value={date}
        mode={mode}
        is24Hour={true}
        display='default'
        onChange={onChange}
        style={{width: 255, backgroundColor: 'white', alignItems: 'center'}}
        />
      )}
      <Button
        title="schedule notification"
        onPress={scheduleNotificationHandler}
      />
      {/* <Button
        title="send push notification"
        onPress={sendPushNotificationHandler}
      /> */}
       </ScrollView>
      <TaskInputField addTask={addTask}/>
      {/* <Text style={{fontWeight: "bold", fontSize: 20}}>{text}</Text> */}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  heading: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 50,
    marginBottom: 10,
    marginLeft: 20,
  },
  scrollView: {
    marginBottom: 70,
  },
  taskContainer: {
    marginTop: 20,
  }
});

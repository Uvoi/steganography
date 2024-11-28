import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    main: {
      flex: 1,
      padding: 20,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    container: {
      width: '50%',
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginBottom: 10,
      gap: 30,
    },
    photo: {
      height: 200,
      width: 300,
      marginHorizontal: 5,
    },
    input: {
      height: 40,
      width: '40%',
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
    },
    encryption: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    outputKey: {
      width: '100%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
    },
    copyBtn: {
      fontSize: 10,
      backgroundColor: 'gray',
      color: 'black',
      padding: 8,
      borderRadius: 10,
    },
  });
  
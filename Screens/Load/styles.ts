import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    main: {
      flex: 1,
      padding: 20,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 10,
      gap: 30,
    },
    photo: {
      height: 200,
      width: 300,
      marginHorizontal: 5,
    },
    output: {
      height: 40,
      width: '40%',
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginTop: 20,
    },
    encryption: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
  });
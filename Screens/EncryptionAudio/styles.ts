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

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  audioPathText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  downloadLink: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },

  playerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  encryption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  CustomButton: {
    fontSize: 14,
    backgroundColor: '#2196f3',
    color: 'white',
    padding: 8,
    borderRadius: 2,
    textDecorationLine: 'none',
    textTransform: 'uppercase',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  copyBtn: {
    fontSize: 10,
    backgroundColor: 'gray',
    color: 'black',
    padding: 8,
    borderRadius: 10,
  },

  input: {
    height: 40,
    width: '40%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  outputKey: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

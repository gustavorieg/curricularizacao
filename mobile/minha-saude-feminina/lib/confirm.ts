import { Alert, Platform } from 'react-native';

/**
 * Alert.alert nao exibe nada no React Native Web (react-native-web nao implementa
 * um dialogo de confirmacao), entao usamos window.confirm nesse caso.
 */
export function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Deletar', style: 'destructive', onPress: onConfirm },
  ]);
}

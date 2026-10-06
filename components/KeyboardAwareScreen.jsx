import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Screen wrapper that keeps focused inputs visible above the phone keyboard
 * and allows the user to keep scrolling while typing.
 */
export default function KeyboardAwareScreen({
  children,
  style,
  contentContainerStyle,
  edges = ['top'],
  scroll = true,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 8 : 0,
  bottomPadding = 48,
}) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event) => {
      setKeyboardHeight(event?.endCoordinates?.height || 0);
    };
    const onHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const extraBottom = keyboardHeight > 0 ? Math.max(bottomPadding, keyboardHeight * 0.15) : bottomPadding;

  return (
    <SafeAreaView style={[styles.screen, style]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: extraBottom },
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentInsetAdjustmentBehavior="always"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

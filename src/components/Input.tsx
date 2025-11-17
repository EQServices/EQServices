import React, { useState } from 'react';
import { StyleSheet, ViewStyle, TextInputProps as RNTextInputProps } from 'react-native';
import { TextInput, HelperText, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import { colors } from '../theme/colors';

export interface InputProps extends Omit<PaperTextInputProps, 'error'> {
  error?: string | boolean;
  helperText?: string;
  showHelperText?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  error,
  helperText,
  showHelperText = true,
  containerStyle,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const displayHelperText = showHelperText && (helperText || error);

  return (
    <>
      <TextInput
        {...props}
        mode="outlined"
        error={hasError}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.input,
          focused && styles.focused,
          hasError && styles.error,
          containerStyle,
          style,
        ]}
        outlineColor={hasError ? colors.error : colors.border}
        activeOutlineColor={hasError ? colors.error : colors.primary}
        selectionColor={colors.primary}
      />
      {displayHelperText && (
        <HelperText
          type={hasError ? 'error' : 'info'}
          visible={true}
          style={styles.helperText}
        >
          {error && typeof error === 'string' ? error : helperText}
        </HelperText>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 4,
    backgroundColor: colors.background,
  },
  focused: {
    backgroundColor: colors.background,
  },
  error: {
    backgroundColor: colors.background,
  },
  helperText: {
    marginTop: -4,
    marginBottom: 12,
    fontSize: 12,
  },
});

export default Input;


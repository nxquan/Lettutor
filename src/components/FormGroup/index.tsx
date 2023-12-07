import {View, Text, TextInput} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '@/constants';
import {isEmail, isPassword} from '@/utils';

type Props = {
  title: string;
  type?: string;
  placeholder?: string;
  field: string;
  value: string;
  duplicateValue?: string;
  onChange: any;
  required?: boolean;
  editable?: boolean;
};

const FormGroup = (props: Props) => {
  const {
    title,
    type,
    placeholder,
    field,
    value,
    onChange,
    duplicateValue,
    required,
    editable,
  } = props;
  const [isShowPassword, setIsShowPassword] = useState(type === 'password');
  const [error, setError] = useState('');

  const renderActionShow = () => {
    if (type === 'password') {
      if (isShowPassword) {
        return (
          <Ionicons
            onPress={() => {
              setIsShowPassword(!isShowPassword);
            }}
            style={styles.icon}
            name="eye-outline"
            size={24}
            color="black"
          />
        );
      } else {
        return (
          <Ionicons
            onPress={() => {
              setIsShowPassword(!isShowPassword);
            }}
            style={styles.icon}
            name="eye-off-outline"
            size={24}
            color="black"
          />
        );
      }
    }
  };

  const validate = () => {
    switch (field) {
      case 'email':
        if (!isEmail(value)) {
          setError('Email không hợp lệ');
        }
        break;
      case 'password':
      case 'currentPassword':
      case 'newPassword': {
        if (!isPassword(value)) {
          setError(
            'Mật khẩu ít nhất 6 kí tự', // gồm kí tự hoa, thường, chữ số và đặc biệt',
          );
        }
        break;
      }
      case 'confirmPassword':
        if (value.length === 0) {
          setError(
            'Mật khẩu ít nhất 6 kí tự', // gồm kí tự hoa, thường, chữ số và đặc biệt',
          );
        }

        const isMatchConfirm = value === duplicateValue;
        if (!isMatchConfirm) {
          setError('Mật khẩu phải giống nhau!');
        }
        break;
      case 'code': {
        const isMatch = String(value).match(/^[0-9]+$/);
        if (!isMatch || value.length !== 6) {
          setError('Mã code bao gồm 6 chữ số');
        }
        break;
      }
      default:
    }
  };

  const getKeyboardType = () => {
    if (type?.includes('number') || type?.includes('phone')) {
      return 'number-pad';
    }
    return 'default';
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title} className="text-gray-800">
        {required && <Text className="text-red-500">* </Text>}
        {title}
      </Text>
      <View
        style={[
          styles.textControl,
          error.length > 0 && styles.textControlError,
          editable === false && {backgroundColor: colors.grey200},
        ]}>
        <TextInput
          style={styles.textInput}
          keyboardType={getKeyboardType()}
          placeholder={placeholder}
          placeholderTextColor={colors.text}
          secureTextEntry={isShowPassword}
          editable={editable}
          onBlur={() => {
            validate();
          }}
          onFocus={() => {
            setError('');
          }}
          value={value}
          onChangeText={value => {
            onChange(field, value);
          }}
        />
        {renderActionShow()}
      </View>
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default React.memo(FormGroup);

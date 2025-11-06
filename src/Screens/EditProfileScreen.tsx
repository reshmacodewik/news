import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../Utils/api/common';
import {
  API_GET_PROFILE,
  API_EDIT_PROFILE,
} from '../Utils/api/APIConstant';
import { getApiWithOutQuery } from '../Utils/api/common';
import { goBackNavigation } from '../Navigators/utils';
import styles from '../style/EditProfileStyles';
import { useTheme } from '../context/ThemeContext';

const BACK_ARROW = require('../icons/back.png');
const USER_ICON = require('../icons/user.png');
const CAMERA_ICON = require('../icons/camera.png');

interface ImageInterface {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
   const { theme, colors } = useTheme();
  const [imageUri, setImageUri] = useState<ImageInterface | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [timezone, setTimezone] = useState('GMT+05:30');
  const [saving, setSaving] = useState(false);

  // ✅ Fetch Profile
  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile-info'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_GET_PROFILE });
      return res.data ?? {};
    },
  });

  // ✅ Prefill data
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setPhone(profileData.phoneNumber || '');
      setLanguage(profileData.language || 'en-US');
      setTimezone(profileData.timezone || 'GMT+05:30');
      if (profileData.photo) {
        setImageUri({ uri: profileData.photo });
      }
    }
  }, [profileData]);

  // ✅ Image Picker
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      const asset = response?.assets?.[0];
      if (asset?.uri) {
        setImageUri({
          uri: asset.uri,
          fileName: asset.fileName ?? `profile-${Date.now()}.jpg`,
          type: asset.type ?? 'image/jpeg',
        });
      }
    });
  };

  // ✅ Save Profile
  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email);
      formData.append('phoneNumber', phone);
      formData.append('language', language);
      formData.append('timezone', timezone);

      if (imageUri?.uri && imageUri.uri.startsWith('file')) {
        formData.append('photo', {
          uri: imageUri.uri,
          name: imageUri.fileName ?? `profile-${Date.now()}.jpg`,
          type: imageUri.type ?? 'image/jpeg',
        } as any);
      }

      const res = await apiPost({
        url: API_EDIT_PROFILE,
        values: formData,
        isForm: true, // ✅ Tell API layer it’s multipart/form-data
      });

      if (res?.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        await queryClient.invalidateQueries({ queryKey: ['profile-info'] });
        refetch();
        goBackNavigation();
      } else {
        Alert.alert('Error', res?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.log('Profile update failed:', err);
      Alert.alert('Error', 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
     <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ height: insets.top }} />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBackNavigation} style={styles.backButton}>
          <Image source={BACK_ARROW} style={[styles.backIcon,{tintColor:colors.text}]} />
        </TouchableOpacity>
        <Text style={[styles.navTitle,{color:colors.text}]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              <Image
                source={imageUri ? { uri: imageUri.uri } : USER_ICON}
                style={styles.profileImage}
              />
              <View style={styles.cameraBadge}>
                <Image source={CAMERA_ICON} style={[styles.cameraIcon,{tintColor:colors.text}]}  />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName,{color:colors.text}]}>{name || ' '}</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel,{color:colors.text}]}>PROFILE INFORMATION</Text>

          <Text style={[styles.label,{color:colors.text}]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Full name"
          />

          <Text style={[styles.label,{color:colors.text}]}>Email</Text>
          <TextInput
            value={email}
            editable={false}
            style={[styles.input, { color: '#999' }]}
          />

        
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;

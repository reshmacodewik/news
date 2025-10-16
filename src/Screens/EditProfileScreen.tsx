import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiWithOutQuery } from '../Utils/api/common';
import { API_EDIT_PROFILE, API_GET_PROFILE } from '../Utils/api/APIConstant';
import { goBackNavigation } from '../Navigators/utils';
import styles from '../style/EditProfileStyles';

interface ImageInterface {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

const BACK_ARROW = require('../icons/back.png');
const USER_ICON = require('../icons/user.png');
const CAMERA_ICON = require('../icons/camera.png');

const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Form state
  const [imageUri, setImageUri] = useState<ImageInterface | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch profile
  const { data: profileData, isError } = useQuery({
    queryKey: ['profile-info'],
    queryFn: async () => {
      try {
        const res = await getApiWithOutQuery({ url: API_GET_PROFILE });
        return res.data ?? {};
        console.log('res', res);
      } catch (err: any) {
        console.log(
          'Failed to fetch profile',
          err.response?.status,
          err.response?.data,
        );
        throw err;
      }
    },
  });

  // Prefill form when data arrives
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setPhone(profileData.phoneNumber || '');
      if (profileData.photo) {
        setImageUri({ uri: profileData.photo });
      }
    }
  }, [profileData]);

  // Mutation to update profile
  const { mutate: updateProfile, isPending: updating } = useMutation({
    mutationFn: async (payload: FormData) => {
      try {
        const res = await apiPost({ url: API_EDIT_PROFILE, values: payload });
        return res.data;
      } catch (err: any) {
        console.log(
          'Failed to update profile',
          err.response?.status,
          err.response?.data,
        );
        throw err;
      }
    },
    onSuccess: () => {
      console.log('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile-info'] });
      goBackNavigation();
    },
  });

  const handleBackPress = () => goBackNavigation();

  // Pick image
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      response => {
        const asset = response?.assets?.[0];
        if (asset?.uri) {
          setImageUri({
            uri: asset.uri,
            fileName: asset.fileName || `profile-${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            fileSize: asset.fileSize,
          });
        }
      },
    );
  };

  // Save profile
  const handleSave = () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phoneNumber', phone);

    if (imageUri?.uri) {
      formData.append('photo', {
        uri: imageUri.uri,
        name: imageUri.fileName ?? `profile-${Date.now()}.jpg`,
        type: imageUri.type ?? 'image/jpeg',
      } as any);
    }

    // Debug log
    console.log('Submitting FormData:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    if (imageUri) console.log('Image:', imageUri);

    updateProfile(formData);
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image source={BACK_ARROW} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
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
                <Image source={CAMERA_ICON} style={styles.cameraIcon} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{name || ' '}</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>PROFESSIONAL INFORMATION</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#8892a6"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Example@email.com"
            placeholderTextColor="#8892a6"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveText}>{updating ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;

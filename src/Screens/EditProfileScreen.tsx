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
import { API_EDIT_PROFILE, API_GET_PROFILE} from '../Utils/api/APIConstant';
import { goBackNavigation, navigate } from '../Navigators/utils';
import styles from '../style/EditProfileStyles';

const BACK_ARROW = require('../icons/back.png');

const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Form state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch profile
  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ['profile-info'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_GET_PROFILE });
   console.log('Profile data:', res.data);
          return res.data ?? {};
    },
  });

  // Prefill form when data arrives
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setPhone(profileData.phoneNumber || '');
      setImageUri(profileData.photo || null);
    }
  }, [profileData]);

  // Mutation to update profile
  const { mutate: updateProfile, isPending: updating } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiPost({
        url: API_EDIT_PROFILE,
        values: payload,
      });
      return res.data;
    },
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['profile-info'] });
        goBackNavigation(); // go back after saving
    },
    onError: (error) => {
      console.log('Failed to update profile', error);
    },
  });

  const handleBackPress = () => {
    navigate('Home');
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.9,
      },
      (response) => {
        if (response?.assets?.[0]?.uri) {
          setImageUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleSave = () => {
    const payload = {
      name,
      email,
      phoneNumber: phone,
      photo: imageUri,
    };
    updateProfile(payload);
  };

  if (isLoading) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Loading profile...</Text>;
  if (isError) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Failed to load profile</Text>;

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
          <Image source={BACK_ARROW} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <Image source={require('../icons/user.png')} style={styles.userIcon} />
              )}

              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <Image source={require('../icons/camera.png')} style={styles.cameraIcon} />
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

          <Text style={styles.label}>Phone No</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="98-888-999"
            placeholderTextColor="#8892a6"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveText}>{updating ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
